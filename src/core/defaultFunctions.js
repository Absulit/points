export const defaultVertexBody = /*wgsl*/`
fn defaultVertexBody(position: vec4<f32>, color: vec4<f32>, uv: vec2<f32>) -> Fragment {
    var result: Fragment;

    let ratioX = params.screenWidth / params.screenHeight;
    let ratioY = 1 / ratioX / (params.screenHeight / params.screenWidth);
    result.ratio = vec2(ratioX, ratioY);
    result.position = vec4<f32>(position);
    result.color = vec4<f32>(color);
    result.uv = uv;
    result.uvr = vec2(uv.x * result.ratio.x, uv.y);
    result.mouse = vec2(params.mouseX / params.screenWidth, params.mouseY / params.screenHeight);
    result.mouse = result.mouse * vec2(1,-1) - vec2(0, -1); // flip and move up

    return result;
}
`;



