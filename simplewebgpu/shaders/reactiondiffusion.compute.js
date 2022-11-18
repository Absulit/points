const reactiondiffusionCompute = /*wgsl*/`
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
    testValue: f32,
    squaresCreated: f32
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

fn getPointsAround(position: vec2<i32>, distance: i32) -> array<  Chemical, 8  >{
    let index0 = (position.x-distance) + ( (position.y-distance) * 800);
    let index1 = (position.x)           + ( (position.y-distance) * 800);
    let index2 = (position.x+distance) + ( (position.y-distance) * 800);
    let index3 = (position.x-distance) + ( (position.y) * 800);
    let index4 = (position.x+distance) + ( (position.y) * 800);
    let index5 = (position.x-distance) + ( (position.y+distance) * 800);
    let index6 = (position.x)           + ( (position.y+distance) * 800);
    let index7 = (position.x+distance) + ( (position.y+distance) * 800);
    return array< Chemical, 8 >(
        particles.chemicals[index0],
        particles.chemicals[index1],
        particles.chemicals[index2],
        particles.chemicals[index3],
        particles.chemicals[index4],
        particles.chemicals[index5],
        particles.chemicals[index6],
        particles.chemicals[index7]
    );
}

fn laplaceA(position:vec2<i32>, chemical:Chemical) -> f32{
    let pointsAround = getPointsAround(position, 1);
    //     if (pointsAround.includes(null)) {
    //         return 0;
    //     }
    let direct = .2;
    let diagonal = .05;
    var sum = 0.;

    sum += chemical.a * -1.;

    sum += pointsAround[1].a * direct;
    sum += pointsAround[3].a * direct;
    sum += pointsAround[4].a * direct;
    sum += pointsAround[6].a * direct;

    sum += pointsAround[0].a * diagonal;
    sum += pointsAround[2].a * diagonal;
    sum += pointsAround[5].a * diagonal;
    sum += pointsAround[7].a * diagonal;

    return sum;
}

fn laplaceB(position:vec2<i32>, chemical:Chemical) -> f32{
    let pointsAround = getPointsAround(position, 1);
    //     if (pointsAround.includes(null)) {
    //         return 0;
    //     }
    let direct = .2;
    let diagonal = .05;
    var sum = 0.;

    sum += chemical.b * -1.;

    sum += pointsAround[1].b * direct;
    sum += pointsAround[3].b * direct;
    sum += pointsAround[4].b * direct;
    sum += pointsAround[6].b * direct;

    sum += pointsAround[0].b * diagonal;
    sum += pointsAround[2].b * diagonal;
    sum += pointsAround[5].b * diagonal;
    sum += pointsAround[7].b * diagonal;

    return sum;
}

//'function', 'private', 'push_constant', 'storage', 'uniform', 'workgroup'
@group(0) @binding(0) var<storage, read_write> layer0: Points;
@group(0) @binding(1) var feedbackSampler: sampler;
@group(0) @binding(2) var feedbackTexture: texture_2d<f32>;
@group(0) @binding(3) var outputTex : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(4) var <storage, read_write> variables: Variables;
@group(0) @binding(5) var <storage, read_write> particles: Particles;
@group(0) @binding(6) var<uniform> params: Params;
@group(0) @binding(7) var <storage, read_write> particles2: Particles;

struct Chemical{
    a: f32,
    b: f32
}

struct Particles{
    chemicals: array<Chemical>
}

var<private> numParticles:u32 = 800*800;
//var<workgroup> particles: array<Planet, 8>;
//var<private> particlesCreated = false;

const workgroupSize = 8;
const PI = 3.14159265;
const MARGIN = 20;
const SQUARESIDE = 400;

const RATIO = 1.;

// .1,.5,.055,.062 // original
// .1,.5,.022,.050 // scary
// .1,.6,.011,.040
// .95,.6,.011,.040
// .98,.8,.011,.040 // wavy brainy
// .98,.9,.014,.046 // fungi
// .98,.9,.013,.046 // fungi
// .98,.9,.012,.045 // fungi
// .98,.9,.012,.044 // fungi

const DA = 1.; //1.
const DB = .5; //.5
const FEED = .055; // .055
const K = .062; //.062

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    var l0 = layer0.points[0];
    let utime = params.utime;
    let chemical = particles.chemicals[0];
    let chemical2 = particles2.chemicals[0];

    let sc: ptr<storage, f32, read_write> = &variables.squaresCreated;

    if((*sc) == 0){

        for(var k:u32; k<numParticles;k++){
            particles.chemicals[k] = Chemical(1, 0);
            particles2.chemicals[k] = Chemical(1, 0);
        }

        let centerIndex:u32 = u32((400 - SQUARESIDE*.5) +( (400 - SQUARESIDE*.5)*800));

        for (var i:u32 = 0; i < SQUARESIDE; i++) {
            for (var j:u32 = 0; j < SQUARESIDE; j++) {
                //index = i+(j*800)
                let chemical = &particles.chemicals[centerIndex + i+(j*800)];
                (*chemical).b = 1;
            }
        }

        // for (var i:u32 = 0; i < SQUARESIDE; i++) {
        //     for (var j:u32 = 0; j < SQUARESIDE; j++) {
        //         // const point = screen.getPointAt(i + this._screen.center.x - squareSide * 1.3, j + this._screen.center.y - squareSide * 1.1);
        //         // point.chemicals.b = 1;
        //     }
        // }



        (*sc) = 1;
    }




    //let dims : vec2<u32> = textureDimensions(feedbackTexture, 0);
    var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2(0),  0.0).rgba;
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


            //--------------------------------------------------------------
            let chemicalBelow = &particles.chemicals[ux+(uy*800)];
            let chemicalAbove = &particles2.chemicals[ux+(uy*800)];

            let chemicalAboveClone = particles2.chemicals[ux+(uy*800)];

            (*chemicalAbove).a = (*chemicalBelow).a;
            (*chemicalAbove).b = (*chemicalBelow).b;

            (*chemicalBelow).a = chemicalAboveClone.a;
            (*chemicalBelow).b = chemicalAboveClone.b;

            //--------------------------------------------------------------

            let a = chemicalAboveClone.a ;
            let b = chemicalAboveClone.b ;
            let position = vec2<i32>(ix, iy);
            (*chemicalBelow).a = a + (DA * laplaceA(position, (*chemicalBelow))) - (a*b*b) + (FEED * (1-a));
            (*chemicalBelow).b = b + (DB * laplaceB(position, (*chemicalBelow))) + (a*b*b) - ((K + FEED) * b);

            (*chemicalBelow).a = clamp( (*chemicalBelow).a, 0, 1 );
            (*chemicalBelow).b = clamp( (*chemicalBelow).b, 0, 1 );

            let c = clamp( (*chemicalBelow).a - (*chemicalBelow).b, 0, 1 );


            //let colorsAround = getColorsAround(vec2<i32>(ix,iy), 1);
            //rgba = soften8(rgba, colorsAround, 1.);


            textureStore(outputTex, vec2<u32>(ux,uy), vec4<f32>(c));

        }


    }




    

    //workgroupBarrier();

}
`;

export default reactiondiffusionCompute;
