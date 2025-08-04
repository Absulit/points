/* @ts-self-types="./debug.d.ts" */
/**
 * Visual debugging methods like drawing a cross on screen and
 * drawing a square around the screen.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/debug
 */

/**
 * Draws an infinite cross.
 * Useful to draw it where the mouse is.
 * @type {String}
 * @param {vec2f} position
 * @param {vec4f} color
 * @param {vec2f} uv
 *
 * @example
 * // js
 * import { showDebugCross } from 'points/debug';
 *
 * // wgsl string
 * ${showDebugCross}
 * let value = showDebugCross(position, color, uvr);
 */
const showDebugCross = /*wgsl*/`
fn showDebugCross(position:vec2<f32>, color:vec4<f32>, uv:vec2<f32>) -> vec4<f32>{
    let horizontal = sdfLine(vec2(0, position.y), vec2(10, position.y), 1., uv) * color;
    let vertical = sdfLine(vec2(position.x, 0), vec2(position.x, 10), 1., uv) * color;
    return vertical + horizontal;
}
`;

/**
 * Border around the screen
 * @type {String}
 * @param {vec4f} color
 * @param {vec2f} uv
 *
 * @example
 * // js
 * import { showDebugFrame } from 'points/debug';
 *
 * // wgsl string
 * ${showDebugFrame}
 * let value = showDebugFrame(color, uvr);
 */
const showDebugFrame = /*wgsl*/`
fn showDebugFrame(color:vec4<f32>, uv:vec2<f32>) -> vec4<f32> {
    let ratioX = params.screen.x / params.screen.y;
    let ratioY = 1. / ratioX / (params.screen.y / params.screen.x);
    let ratio = vec2(ratioX, ratioY);

    let topRight = vec2(1., 1.) * ratio;
    let topLeft = vec2(0., 1.);
    let bottomLeft = vec2(0., 0.);
    let bottomRight = vec2(1., 0.) * ratio;

    let top = sdfLine(topLeft, topRight, 1., uv) * color;
    let bottom = sdfLine(bottomLeft, bottomRight, 1., uv) * color;
    let left = sdfLine(bottomLeft, topLeft, 1., uv) * color;
    let right = sdfLine(bottomRight, topRight, 1., uv) * color;
    return top + bottom + left + right;
}
`;

export { showDebugCross, showDebugFrame };
