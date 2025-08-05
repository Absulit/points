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
export const showDebugCross: string;
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
export const showDebugFrame: string;
