import defaultStructs from './defaultStructs.js';

const planets3Vert = /*wgsl*/`

${defaultStructs}

struct Planet{
    radius: f32,
    speed: f32,
    angle: f32
}

struct Variable{
    pc: f32
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

export default planets3Vert;