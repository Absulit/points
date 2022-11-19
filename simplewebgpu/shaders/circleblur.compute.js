const circleblurCompute = /*wgsl*/`

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
    testValue: f32
}

struct Chemical{
    a: f32,
    b: f32
}

struct Particles{
    chemicals: array<Chemical>
}
const clearMixlevel = 1.01;//1.01
fn clearMix(color:vec4<f32>) -> vec4<f32> {
    let rr = color.r / clearMixlevel;
    let gr = color.g / clearMixlevel;
    let br = color.b / clearMixlevel;
    return vec4<f32>(rr, gr, br, color.a);
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

var<workgroup> tile : array<array<vec3<f32>, 128>, 4>;

const workgroupSize = 8;

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
    let tv: ptr<storage, f32, read_write> = &variables.testValue;


    //let dims : vec2<u32> = textureDimensions(feedbackTexture, 0);
    //let rgb = textureSampleLevel(feedbackTexture, feedbackSampler, (vec2<f32>(0) + vec2<f32>(0.25, 0.25)) / vec2<f32>(dims),0.0).rgb;
    //--------------------------------------------------------------

    let filterDim = 128u;
    let blockDim = 128u;
    let flipValue = 0u;

    let filterOffset : u32 = (filterDim - 1u) / 2u;
    let dims : vec2<u32> = textureDimensions(feedbackTexture, 0);

    let baseIndex = vec2<i32>(
        WorkGroupID.xy * vec2<u32>(blockDim, 4u) +
        LocalInvocationID.xy * vec2<u32>(4u, 1u)
    ) - vec2<i32>(i32(filterOffset), 0);

    // for (var r : u32 = 0u; r < 4u; r = r + 1u) {
    //     for (var c : u32 = 0u; c < 4u; c = c + 1u) {
    //         var loadIndex = baseIndex + vec2<i32>(i32(c), i32(r));
    //         if (flipValue != 0u) {
    //             loadIndex = loadIndex.yx;
    //         }

    //         tile[r][4u * LocalInvocationID.x + c] = textureSampleLevel(
    //             feedbackTexture,
    //             feedbackSampler,
    //             (vec2<f32>(loadIndex) + vec2<f32>(0.25, 0.25)) / vec2<f32>(dims), 
    //             0.0
    //         ).rgb;
    //     }
    // }

    // workgroupBarrier();

    // for (var r : u32 = 0u; r < 4u; r = r + 1u) {
    //     for (var c : u32 = 0u; c < 4u; c = c + 1u) {
    //         var writeIndex = baseIndex + vec2<i32>(i32(c), i32(r));
    //         if (flipValue != 0u) {
    //             writeIndex = writeIndex.yx;
    //         }

    //         let center : u32 = 4u * LocalInvocationID.x + c;
    //         if (center >= filterOffset &&
    //             center < 128u - filterOffset &&
    //             all(writeIndex < vec2<i32>(dims))) {
    //             var acc : vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
    //             for (var f : u32 = 0u; f < filterDim; f = f + 1u) {
    //                 var i : u32 = center + f - filterOffset;
    //                 acc = acc + (1.0 / f32(filterDim)) * tile[r][i];
    //             }
    //             textureStore(outputTex, writeIndex, vec4<f32>(acc, 1.0));
    //         }
    //     }
    // }

    let rgb = textureSampleLevel(feedbackTexture,feedbackSampler, vec2<f32>(0,0),  0.0).rgba;

    // textureStore(outputTex, vec2<i32>(0,0), vec4<f32>(1,1,0, 1.0));
    // textureStore(outputTex, vec2<i32>(1,0), vec4<f32>(1,0,0, 1.0));
    // textureStore(outputTex, vec2<i32>(799,0), vec4<f32>(1,0,0, 1.0));


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
            var rgba = textureSampleLevel(feedbackTexture,feedbackSampler, vec2<f32>(x,y),  0.0).rgba;

            //rgba += vec4<f32>(1.,0.,0.,.5);
            rgba = clearMix(rgba) + vec4<f32>(1.,0.,0., .5);

            textureStore(outputTex, vec2<u32>(ux,uy), rgba);

        }


    }



}
`;

export default circleblurCompute;