export { defaultFunctions as default };
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
declare const defaultFunctions: "\n\n/**\n * The defaultVertexBody is used as a drop-in replacement of the vertex shader content.\n * <br>\n * This is not required, but useful if you plan to use the default parameters of the library.\n * <br>\n * All the examples in the examples directory use this function in their vert.js file.\n * <br>\n * <br>\n * Default function for the Vertex shader that takes charge of automating the\n * creation of a few variables that are commonly used.\n * @example\n * // Inside the main vertex function add this\n * return defaultVertexBody(in.position, in.color, in.uv, in.normal);\n * @type {string}\n * @param {vec4f} position\n * @param {vec4f} color\n * @param {vec2f} uv\n * @return {FragmentIn}\n */\n\nfn defaultVertexBody(position: vec4f, color: vec4f, uv: vec2f, normal: vec3f) -> FragmentIn {\n    var result: FragmentIn;\n\n    let ratio = params.ratios[RENDERPASSINDEX];\n\n    result.ratio = ratio;\n    result.position = position;\n    result.color = color;\n    result.uv = uv;\n    result.uvr = uv * ratio;\n    result.mouse = params._mouse_normalized;\n    result.normal = normal;\n\n    return result;\n}\n";
