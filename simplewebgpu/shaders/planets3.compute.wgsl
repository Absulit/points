var<private> rand_seed : vec2<f32>;

fn rand() -> f32 {
    rand_seed.x = fract(cos(dot(rand_seed, vec2<f32>(23.14077926, 232.61690225))) * 136.8168);
    rand_seed.y = fract(cos(dot(rand_seed, vec2<f32>(54.47856553, 345.84153136))) * 534.7645);
    return rand_seed.y;
}

fn rand2(co: vec2<f32>) -> f32 {
     return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

struct Params {
    utime: f32,
    screenWidth:f32,
    screenHeight:f32
}

struct Color{
    r: f32,
    g: f32,
    b: f32,
    a: f32
}

struct Position{
    x: f32,
    y: f32,
    z: f32,
    w: f32
}

struct Vertex {
    position: Position,
    color: Color,
    uv: array<f32,2>,
}

struct Point {
    vertex0: Vertex,
    vertex1: Vertex,
    vertex2: Vertex,
    vertex3: Vertex,
    vertex4: Vertex,
    vertex5: Vertex,
}

struct Points {
    points: array<Point>
}

struct Variables{
    particlesCreated: f32,
    testValue: f32
}

const clearMixlevel = 1.01;//1.01
fn clearMix(color:vec4<f32>) -> vec4<f32> {
    let rr = color.r / clearMixlevel;
    let gr = color.g / clearMixlevel;
    let br = color.b / clearMixlevel;
    return vec4<f32>(rr, gr, br, color.a);
}

fn polar(distance: f32, radians: f32) -> vec2<f32> {
    return vec2<f32>(distance * cos(radians), distance * sin(radians));
}

// fn fnusin(speed: f32) -> f32{
//     return sin(params.utime * speed) * .5;
// }
// fn fusin(speed: f32) -> f32{
//     return sin(params.utime * speed);
// }

//'function', 'private', 'push_constant', 'storage', 'uniform', 'workgroup'
@group(0) @binding(0) var<storage, read_write> layer0: Points;
@group(0) @binding(1) var feedbackSampler: sampler;
@group(0) @binding(2) var feedbackTexture: texture_2d<f32>;
@group(0) @binding(3) var outputTex : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(4) var <storage, read_write> variables: Variables;
@group(0) @binding(5) var <storage, read_write> particles: Particles;
@group(0) @binding(6) var<uniform> params: Params;

struct Planet{
    radius: f32,
    speed: f32,
    angle: f32
}

struct Particles{
    planets: array<Planet>
}

var<private> numParticles:u32 = 4096;
//var<workgroup> particles: array<Planet, 8>;
//var<private> particlesCreated = false;

const workgroupSize = 8;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    var l0 = layer0.points[0];
    let utime = params.utime;

    let pc: ptr<storage, f32, read_write> = &variables.particlesCreated;

    if((*pc) == 0){
        for(var k:u32; k<numParticles; k++){
            particles.planets[k] = Planet(rand() * 32, rand() * 10, rand() * 360 );
        }

        (*pc) = 1;
    }




    //let dims : vec2<u32> = textureDimensions(feedbackTexture, 0);
    //let rgb = textureSampleLevel(feedbackTexture, feedbackSampler, (vec2<f32>(0) + vec2<f32>(0.25, 0.25)) / vec2<f32>(dims),0.0).rgb;
    //--------------------------------------------------------------

    let dims: vec2<u32> = textureDimensions(feedbackTexture, 0);

    let numColumns:f32 = f32(dims.x);
    let numRows:f32 = f32(dims.y);
    //let constant = u32(numColumns) / 93u;

    let numColumnsPiece:i32 = i32(numColumns / f32(workgroupSize));
    let numRowsPiece:i32 = i32(numRows / f32(workgroupSize));

    for (var indexColumns:i32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
        let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
        let ux = u32(x);
        let nx = x / numColumns;
        for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

            let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
            let uy = u32(y);
            let ny = y / numRows;

            //let index:f32 = y + (x * screenSize.numColumns);
            var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(x,y),  0.0).rgba;

            //rgba += vec4<f32>(1.,0.,0.,.5);
            //rgba = clearMix(rgba);

            textureStore(outputTex, vec2<u32>(ux,uy), rgba);

        }


    }

    //workgroupBarrier();

    let numIndexPiece:u32 = numParticles / workgroupSize * workgroupSize;

    for(var indexPiece:u32; indexPiece<numIndexPiece; indexPiece++){
        let k:u32 = WorkGroupID.x * WorkGroupID.y * numParticles + indexPiece;
        let particle  = &particles.planets[k];
        //var particlePointer = (*particle);


        var rads = radians((*particle).angle);
        var pointFromCenter = polar(  (*particle).radius, rads);
        let x = f32(pointFromCenter.x + 25) * 16; //+ variables.testValue;
        let y = f32(pointFromCenter.y + 25) * 16;
        let ux = u32(x);
        let uy = u32(y);

        variables.testValue += .1;

        if((*particle).angle > 360){
            (*particle).angle = 0.;
        }
        (*particle).angle += ((*particle).speed * .001);

        var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(x, y),  0.0).rgba;

        textureStore(outputTex, vec2<u32>(ux,uy), vec4<f32>(1,1,1,1));
    }


}
