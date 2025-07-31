/**
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
 */
export const showDebugCross: string;
/**
 * Border around the screen
 * @type {String}
 * @param {vec4f} color
 * @param {vec2f} uv
 */
export const showDebugFrame: string;
