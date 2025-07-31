/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module defaultFunctions
 */
/**
 * Default function for the Vertex shader that takes charge of automating the
 * creation of a few variables that are commonly used.
 * @type {string}
 * @param {vec4f} position
 * @param {vec4f} color
 * @param {vec2f} uv
 * @return {Fragment}
 */
export const defaultVertexBody: string;
