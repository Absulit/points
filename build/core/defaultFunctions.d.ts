/**
 * The defaultFunctions are functions already incorporated onto the shaders you create,
 * so you can call them without import.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 *
 * Use the base example as reference: examples/base/vert.js
 * @module defaultFunctions
 */
/**
 * The defaultVertexBody is used as a drop-in replacement of the vertex shader content.
 * <br>
 * This is not required, but useful if you plan to use the default parameters of the library.
 * <br>
 * All the examples in the examples directory use this function in their vert.js file.
 * <br>
 * <br>
 * Default function for the Vertex shader that takes charge of automating the
 * creation of a few variables that are commonly used.
 * @example
 * // Inside the main vertex function add this
 * return defaultVertexBody(position, color, uv, normal);
 * @type {string}
 * @param {vec4f} position
 * @param {vec4f} color
 * @param {vec2f} uv
 * @return {Fragment}
 */
export const defaultVertexBody: string;
