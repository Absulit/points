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

//const clearMixlevel = 1.81;//1.01
fn clearMix(color:vec4<f32>, level:f32) -> vec4<f32> {
    let rr = color.r / level;
    let gr = color.g / level;
    let br = color.b / level;
    var ar = color.a / level;
    if(ar < .09){
        ar = 0.;
    }
    return vec4<f32>(rr, gr, br, ar);
}

// level 2.
fn clearAlpha(currentColor:vec4<f32>, level:f32) -> vec4<f32>{
    let ar = currentColor.a / level;
    return vec4<f32>(currentColor.rgb, ar);
}

fn polar(distance: f32, radians: f32) -> vec2<f32> {
    return vec2<f32>(distance * cos(radians), distance * sin(radians));
}

fn getColorsAround(position: vec2<i32>, distance: i32) -> array<  vec4<f32>, 8  > {
    return array< vec4<f32>,8 >(
        textureLoad(feedbackTexture, vec2<i32>( position.x-distance, position.y-distance  ),  0).rgba,
        textureLoad(feedbackTexture, vec2<i32>( position.x, position.y-distance  ),  0).rgba,
        textureLoad(feedbackTexture, vec2<i32>( position.x+distance, position.y-distance  ),  0).rgba,
        textureLoad(feedbackTexture, vec2<i32>( position.x-distance, position.y  ),  0).rgba,
        textureLoad(feedbackTexture, vec2<i32>( position.x+distance, position.y  ),  0).rgba,
        textureLoad(feedbackTexture, vec2<i32>( position.x-distance, position.y+distance  ),  0).rgba,
        textureLoad(feedbackTexture, vec2<i32>( position.x, position.y+distance  ),  0).rgba,
        textureLoad(feedbackTexture, vec2<i32>( position.x+distance, position.y+distance  ),  0).rgba,
    );
}

fn soften8(color:vec4<f32>, colorsAround:array<vec4<f32>, 8>, colorPower:f32) -> vec4<f32> {
    var newColor:vec4<f32> = color;
    for (var indexColors = 0u; indexColors < 8u; indexColors++) {
        var colorAround = colorsAround[indexColors];
        colorAround.r = (color.r + colorAround.r * colorPower) / (colorPower + 1.);
        colorAround.g = (color.g + colorAround.g * colorPower) / (colorPower + 1.);
        colorAround.b = (color.b + colorAround.b * colorPower) / (colorPower + 1.);
        colorAround.a = (color.a + colorAround.a * colorPower) / (colorPower + 1.);

        newColor += colorAround;
    }
    return newColor / 5;
}

fn fnusin(speed: f32) -> f32{
    return sin(params.utime * speed) * .5;
}
fn fusin(speed: f32) -> f32{
    return sin(params.utime * speed);
}

//'function', 'private', 'push_constant', 'storage', 'uniform', 'workgroup'
@group(0) @binding(0) var<storage, read_write> layer0: Points;
@group(0) @binding(1) var feedbackSampler: sampler;
@group(0) @binding(2) var feedbackTexture: texture_2d<f32>;
@group(0) @binding(3) var outputTex : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(4) var <storage, read_write> variables: Variables;
@group(0) @binding(5) var <storage, read_write> particles: Particles;
@group(0) @binding(6) var<uniform> params: Params;

struct Particle{
    x: f32,
    y: f32,
    angle: f32,
    distance: f32
}

struct Particles{
    items: array<Particle>
}

var<private> numParticles:u32 = 2048;
//var<workgroup> particles: array<Planet, 8>;
//var<private> particlesCreated = false;

const workgroupSize = 8;
const PI = 3.14159265;
const MARGIN = 20;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    var l0 = layer0.points[0];

    let pc: ptr<storage, f32, read_write> = &variables.particlesCreated;

    if((*pc) == 0){
        for(var k:u32; k<numParticles; k++){
            particles.items[k] = Particle(400, 400, rand() * PI * 2, 1. );
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
        let ix = i32(x);
        let nx = x / numColumns;
        for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

            let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
            let uy = u32(y);
            let iy = i32(y);
            let ny = y / numRows;

            //let index:f32 = y + (x * screenSize.numColumns);
            var rgba = textureLoad(feedbackTexture, vec2<i32>(ix,iy), 0).rgba;

            let colorsAround = getColorsAround(vec2<i32>(ix,iy), 1);
            rgba = soften8(rgba, colorsAround, 1.);

            //rgba = vec4<f32>(0,0,0,1);
            //rgba = clearMix(rgba, 1.85);
            rgba = clearAlpha(rgba, 2.54);

            textureStore(outputTex, vec2<u32>(ux,uy), rgba);

        }


    }

    //workgroupBarrier();

    let numIndexPiece:u32 = numParticles / workgroupSize * workgroupSize;

    let turnSpeed = 10. * params.sliderA; //1.
    let distance = 300. * params.sliderB; //17.
    let angleRotation = 360. * params.sliderC; //69.

    for(var indexPiece:u32; indexPiece<=numIndexPiece; indexPiece++){
        let k:u32 = WorkGroupID.x * WorkGroupID.y * numParticles + indexPiece;
        let particle  = &particles.items[k];
        //var particlePointer = (*particle);

        var p = polar( (*particle).distance, (*particle).angle);
        (*particle).x += p.x * .11;
        (*particle).y += p.y * .11;



        p = polar( distance, (*particle).angle);


        let pointForward = vec2( i32((*particle).x + p.x), i32((*particle).y + p.y ));
        p = polar( distance, (*particle).angle + radians(angleRotation));

        let pointRight = vec2( i32((*particle).x + p.x), i32((*particle).y + p.y) );
        p = polar( distance, (*particle).angle - radians(angleRotation));

        let pointLeft = vec2( i32((*particle).x + p.x), i32((*particle).y + p.y) );

        let pointForwardBrightness = textureLoad(feedbackTexture, pointForward,  0).g;
        let pointLeftBrightness = textureLoad(feedbackTexture, pointRight,  0).g;
        let pointRightBrightness = textureLoad(feedbackTexture, pointLeft,  0).g;

        let pointForwardInLimits = i32(dims.x-MARGIN) >= pointForward.x && pointForward.x >= MARGIN  &&  i32(dims.y-MARGIN) >= pointForward.y && pointForward.y >= MARGIN ;
        let pointLeftInLimits = i32(dims.x-MARGIN) >= pointLeft.x && pointLeft.x >= MARGIN  &&  i32(dims.y-MARGIN) >= pointLeft.y && pointLeft.y >= MARGIN;
        let pointRightInLimits = i32(dims.x-MARGIN) >= pointRight.x && pointRight.x >= MARGIN  &&  i32(dims.y-MARGIN) >= pointRight.y && pointRight.y >= MARGIN;


        if(pointForwardInLimits && pointLeftInLimits && pointRightInLimits){

            if(pointForwardInLimits && pointRightInLimits && pointLeftInLimits && (pointForwardBrightness > pointLeftBrightness) && (pointForwardBrightness > pointRightBrightness)){
                // do nothing continue
            }else if( pointForwardInLimits && pointRightInLimits && pointLeftInLimits && (pointForwardBrightness < pointLeftBrightness) && (pointForwardBrightness < pointRightBrightness) ){
                // turn randomly
                (*particle).angle += (rand() - .5) *  turnSpeed * params.utime;
            }else if(pointRightInLimits && pointLeftInLimits && (pointRightBrightness > pointLeftBrightness)){
                // turn right
                (*particle).angle += rand() * turnSpeed * params.utime;
            }else if(pointLeftInLimits && pointRightInLimits && (pointLeftBrightness > pointRightBrightness)){
                // turn left
                (*particle).angle -= rand() * turnSpeed * params.utime;
            }
        }else{
            (*particle).angle = rand() * PI * 2;

        }

        //
        var xy = vec2<f32>( (*particle).x, (*particle).y);
        var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, xy,  0.0).rgba;

        var uxy = vec2<u32>( u32((*particle).x), u32((*particle).y) );
        var ixy = vec2<i32>( i32((*particle).x), i32((*particle).y) );
        rgba = textureLoad(feedbackTexture, ixy,  0).rgba;
        textureStore(outputTex, uxy, vec4<f32>(1,1,1,1) + rgba);
        
    }


}