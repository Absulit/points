
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

struct Params {
  filterDim : u32,
  blockDim : u32,
}

//'function', 'private', 'push_constant', 'storage', 'uniform', 'workgroup'
@group(0) @binding(0) var<storage, read_write> layer0 : Points;
@group(0) @binding(1) var feedbackSampler : sampler;
@group(0) @binding(2) var feedback : texture_2d<f32>;
//@group(0) @binding(8) var<storage, read_write> screenSize : ScreenSize;

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    var l0 = layer0.points[0];

    let filterOffset : u32 = (params.filterDim - 1u) / 2u;
    let dims : vec2<i32> = textureDimensions(feedback, 0);

    let baseIndex = vec2<i32>(
        WorkGroupID.xy * vec2<u32>(params.blockDim, 4u) +
        LocalInvocationID.xy * vec2<u32>(4u, 1u)
    ) - vec2<i32>(i32(filterOffset), 0);


    var loadIndex = baseIndex + vec2<i32>(i32(0), i32(0));
    let rgb = textureSampleLevel(inputTex,samp,(vec2<f32>(loadIndex) + vec2<f32>(0.25, 0.25)) / vec2<f32>(dims),0.0).rgb;


}
