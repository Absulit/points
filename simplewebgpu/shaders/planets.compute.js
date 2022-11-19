const planetsCompute = /*wgsl*/`

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
    screenHeight:f32,
    mouseX: f32,
    mouseY: f32,
    sliderA: f32,
    sliderB: f32,
    sliderC: f32
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
@group(0) @binding(0) var <storage, read_write> layer0: Points;
@group(0) @binding(1) var feedbackSampler: sampler;
@group(0) @binding(2) var feedbackTexture: texture_2d<f32>;
@group(0) @binding(3) var outputTex : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(4) var <storage, read_write> variables: Variables;
@group(0) @binding(5) var <storage, read_write> particles: Particles;
@group(0) @binding(6) var <uniform> params: Params;
@group(0) @binding(7) var <storage, read_write> particles2: Particles;

struct Planet{
    radius: f32,
    speed: f32,
    angle: f32,
    x: f32,
    y: f32
}

struct Particles{
    planets: array<Planet>
}

var<private> numParticles:u32 = 8;
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
    //let chemical = particles.chemicals[0];
    let planet2 = particles2.planets[0];
    let tv: ptr<storage, f32, read_write> = &variables.testValue;

    let pc: ptr<storage, f32, read_write> = &variables.particlesCreated;

    if((*pc) == 0){
        particles.planets[0] = Planet(5, 10, rand() * 360, 0, 0 );
        particles.planets[1] = Planet(10, 7, rand() * 360, 0, 0 );
        particles.planets[2] = Planet(13, 6, rand() * 360, 0, 0 );
        particles.planets[3] = Planet(16, 5, rand() * 360, 0, 0 );
        particles.planets[4] = Planet(20, 5, rand() * 360, 0, 0 );
        particles.planets[5] = Planet(23, 1, rand() * 360, 0, 0 );
        particles.planets[6] = Planet(27, -1, rand() * 360, 0, 0 );
        particles.planets[7] = Planet(32, .1, rand() * 360, 0, 0 );
        (*pc) = 1;
    }




    let dims : vec2<u32> = textureDimensions(feedbackTexture, 0);
    let rgb = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(0) ,0.0).rgb;
    textureStore(outputTex, vec2<u32>(0,0), vec4<f32>(1,1,1,1));

    //--------------------------------------------------------------


    //workgroupBarrier();

    let numIndexPiece:u32 = numParticles / workgroupSize * workgroupSize;

    for(var indexPiece:u32; indexPiece<numIndexPiece; indexPiece++){
        let k:u32 = WorkGroupID.x * WorkGroupID.y * numParticles + indexPiece;
        let particle  = &particles.planets[k];
        //var particlePointer = (*particle);


        var rads = radians((*particle).angle);
        var pointFromCenter = polar(  (*particle).radius, rads);
        let x = f32(pointFromCenter.x); //+ variables.testValue;
        let y = f32(pointFromCenter.y);
        let ux = u32(x);
        let uy = u32(y);

        variables.testValue += .1;

        if((*particle).angle > 360){
            (*particle).angle = 0.;
        }
        (*particle).angle += ((*particle).speed * .1);
        (*particle).x = x;
        (*particle).y = y;

        //var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(x, y),  0.0).rgba;

        //textureStore(outputTex, vec2<u32>(ux,uy), vec4<f32>(1,1,1,1));
    }


}`;

export default planetsCompute;

