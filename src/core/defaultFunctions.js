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
 * return defaultVertexBody(in.position, in.color, in.uv, in.normal);
 * @type {string}
 * @param {vec4f} position
 * @param {vec4f} color
 * @param {vec2f} uv
 * @return {FragmentIn}
 */
export const defaultVertexBody = /*wgsl*/`
fn defaultVertexBody(position: vec4f, color: vec4f, uv: vec2f, normal: vec3f) -> FragmentIn {
    var result: FragmentIn;

    let ratioX = params.screen.x / params.screen.y;
    let ratioY = 1. / ratioX / (params.screen.y / params.screen.x);


    result.ratio = vec2(ratioX, ratioY);
    result.position = position;
    result.color = color;
    result.uv = uv;
    result.uvr = vec2(uv.x * result.ratio.x, uv.y); // fits to height (cuts width)
    // result.uvr = vec2(uv.x , uv.y / result.ratio.x); // fits to width (cuts height)

    if(params.screen.x > params.screen.y){
        result.uvr = vec2(uv.x * result.ratio.x, uv.y); // fits to height (cuts width)
    }else{
        result.uvr = vec2(uv.x, uv.y / result.ratio.x); // fits to width (cuts height)
    }

    result.mouse = vec2(params.mouse.x / params.screen.x, params.mouse.y / params.screen.y);
    result.mouse = result.mouse * vec2(1.,-1.) - vec2(0., -1.); // flip and move up
    result.normal = normal;

    return result;
}
`;
