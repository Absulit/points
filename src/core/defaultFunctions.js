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

const SCALE_MODE_FIT = 1;
const SCALE_MODE_COVER = 2;
const SCALE_MODE_WIDTH = 4;
const SCALE_MODE_HEIGHT = 8;
fn defaultVertexBody(position: vec4f, color: vec4f, uv: vec2f, normal: vec3f) -> FragmentIn {
    var result: FragmentIn;

    var ratioX = 0.;
    var ratioY = 0.;

    let ratio_from_x = params.screen.x / params.screen.y;
    let ratio_from_y = params.screen.y / params.screen.x;

    if(params.scaleMode == SCALE_MODE_FIT){
        let x_gretear_than_y = step(params.screen.y, params.screen.x);
        ratioX = mix(1., ratio_from_x, x_gretear_than_y);
        ratioY = mix(ratio_from_y, 1., x_gretear_than_y);
    }else if(params.scaleMode == SCALE_MODE_COVER){
        let x_gretear_than_y = step(params.screen.y, params.screen.x);
        ratioX = mix(ratio_from_x, 1., x_gretear_than_y);
        ratioY = mix(1., ratio_from_y, x_gretear_than_y);
    }else{
        let scale_mode_equals_height = params.scaleMode == SCALE_MODE_HEIGHT; // else SCALE_MODE_WIDTH
        ratioX = select(1., ratio_from_x, scale_mode_equals_height);
        ratioY = select(ratio_from_y, 1., scale_mode_equals_height);
    }

    result.ratio = vec2(ratioX, ratioY);
    result.position = position;
    result.color = color;
    result.uv = uv;
    result.uvr = vec2();

    let fits_to_height = vec2(uv.x * result.ratio.x, uv.y); // (cuts width)
    let fits_to_width = vec2(uv.x, uv.y * result.ratio.y); // (cuts height)
    if(params.scaleMode == SCALE_MODE_FIT){
        let x_gretear_than_y = step(params.screen.y, params.screen.x);
        result.uvr = mix(fits_to_width, fits_to_height, x_gretear_than_y);
    }else if(params.scaleMode == SCALE_MODE_COVER){
        let y_gretear_than_x = step(params.screen.x, params.screen.y);
        result.uvr = mix(fits_to_width, fits_to_height, y_gretear_than_x);
    }else{
        let scale_mode_equals_height = params.scaleMode == SCALE_MODE_HEIGHT; // else SCALE_MODE_WIDTH
        result.uvr = select(fits_to_width, fits_to_height, scale_mode_equals_height);
    }

    result.mouse = vec2(params.mouse.x / params.screen.x, params.mouse.y / params.screen.y);
    result.mouse = result.mouse * vec2(1., -1.) - vec2(0., -1.); // flip and move up
    result.normal = normal;

    return result;
}
`;
