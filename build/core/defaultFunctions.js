/* @ts-self-types="./defaultFunctions.d.ts" */
/**
 * @type {string}
 * Default function for the Vertex shader that takes charge of automating the
 * creation of a few variables that are commonly used.
 * @param {vec4f} position
 * @param {vec4f} color
 * @param {vec2f} uv
 * @return {Fragment}
 */
const defaultVertexBody = /*wgsl*/`
fn defaultVertexBody(position: vec4<f32>, color: vec4<f32>, uv: vec2<f32>) -> Fragment {
    var result: Fragment;

    let ratioX = params.screen.x / params.screen.y;
    let ratioY = 1. / ratioX / (params.screen.y / params.screen.x);
    result.ratio = vec2(ratioX, ratioY);
    result.position = vec4<f32>(position);
    result.color = vec4<f32>(color);
    result.uv = uv;
    result.uvr = vec2(uv.x * result.ratio.x, uv.y);
    result.mouse = vec2(params.mouse.x / params.screen.x, params.mouse.y / params.screen.y);
    result.mouse = result.mouse * vec2(1.,-1.) - vec2(0., -1.); // flip and move up

    return result;
}
`;

export { defaultVertexBody };
