const defaultVert = /*wgsl*/`

@group(0) @binding(0) var<uniform> params: Params;

struct Particle{
    x: f32,
    y: f32
}

struct Params {
    utime: f32,
    screenWidth:f32,
    screenHeight:f32,
    mouseX: f32,
    mouseY: f32
}

struct Fragment {
    @builtin(position) Position: vec4<f32>,
    @location(0) Color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: f32,
    @location(3) mouse: vec2<f32>
}


@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) VertexIndex: u32
) -> Fragment {

    var result: Fragment;

    result.ratio = params.screenWidth / params.screenHeight;
    result.Position = vec4<f32>(position);
    result.Color = vec4<f32>(color);
    result.uv = vec2(uv.x * result.ratio, uv.y);
    result.mouse = vec2(params.mouseX / params.screenWidth, params.mouseY / params.screenHeight);

    return result;
}
`;

export default defaultVert;