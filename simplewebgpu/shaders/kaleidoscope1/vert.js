import defaultStructs from '../defaultStructs.js';

const kaleidoscope1Vert = /*wgsl*/`

${defaultStructs}

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) VertexIndex: u32
) -> Fragment {

    var result: Fragment;

    let ratioX = params.screenWidth / params.screenHeight;
    let ratioY = 1 / ratioX / (params.screenHeight / params.screenWidth);
    result.ratio = vec2(ratioX, ratioY);
    result.Position = vec4<f32>(position);
    result.Color = vec4<f32>(color);
    result.uv = vec2(uv.x * result.ratio.x, uv.y);
    result.mouse = vec2(params.mouseX / params.screenWidth, params.mouseY / params.screenHeight);

    return result;
}
`;

export default kaleidoscope1Vert;
