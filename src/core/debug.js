export const showDebugCross = /*wgsl*/`
fn showDebugCross(position:vec2<f32>, color:vec4<f32>, uv:vec2<f32>) -> vec4<f32>{
    let horizontal = sdfLine(vec2(0, position.y), vec2(1, position.y), .5, uv) * color;
    let vertical = sdfLine(vec2(position.x, 0), vec2(position.x, 1), .5, uv) * color;
    return vertical + horizontal;
}
`;
