
const yellow:Color = Color(1, 1, 0., 1.);
const green:Color = Color(0., 1, 0., 1.);
const red:Color = Color(1., 0, 0., 1.);
const white:Color = Color(1., 1., 1., 1.);
const orange:Color = Color(1., .64, 0., 1.);

const clearMixlevel = 1.01;//1.01
const colorPower = 1.;
const workgroupSize = 8;

const PI = 3.14159;

struct Particle {
    x: f32,
    y: f32,
    angle: f32,
    distance: f32,
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

struct Screen {
    size: vec2<f32>,
    points: array<f32>
}

struct ScreenSize {
    numRows: f32,
    numColumns: f32,
    uTime: f32,
    notFilled: u32,
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




@group(0) @binding(0) var<storage, read_write> layer0 : Points;
@group(0) @binding(1) var<storage, read_write> layer1 : Points;
@group(0) @binding(7) var<storage, read_write> particles : array<Particle>;
@group(0) @binding(8) var<storage, read_write> screenSize : ScreenSize;

@compute @workgroup_size(workgroupSize,workgroupSize,2)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {

    let l0 = layer0.points[0];
    let l1 = layer1.points[0];
    let p = particles[0];


    let numColumns:f32 = screenSize.numColumns;
    let numRows:f32 = screenSize.numRows;
    let constant = u32(numColumns) / 93u;

    let numColumnsPiece:i32 = i32(screenSize.numColumns / f32(workgroupSize));
    let numRowsPiece:i32 = i32(screenSize.numRows / f32(workgroupSize));
    if (WorkGroupID.z == 0u) {


    }

    if(WorkGroupID.z == 1u){


    }
}
