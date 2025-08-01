/**
 * Creates a circle
 * @type {String}
 * @param {vec2f} position center of the circle
 * @param {f32} radius how big the circle is
 * @param {f32} feather how soft the edges are
 * @param {vec2f} uv uv coordinates
 * @return `f32`
 */
export const sdfCircle: string;
/**
 * Creates a line with a pixel stroke.
 * @type {String}
 * @param {vec2f} p1 start of the line
 * @param {vec2f} p2 end of the line
 * @param {f32} pixelStroke width in pixels with an 800 base
 * @param {vec2f} uv uv coordinates
 * @return `f32`
 */
export const sdfLine: string;
/**
 * Better than sdfLine to create lines
 * @type {String}
 * @param {vec2f} p1 start of the line
 * @param {vec2f} p2 end of the line
 * @param {f32} feather how soft the edges are
 * @param {vec2f} uv uv coordinates
 * @return `f32`
 */
export const sdfLine2: string;
export const sdfRectangle: "\n\n";
/**
 * A few signed distance functions.
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/sdf
 */
/**
 * Function used to create lines. It's a dependency of them.
 * @type {String}
 * @param {vec2f} p uv
 * @param {vec2f} a point A
 * @param {vec2f} b point B
 * @return `f32`
 */
export const sdfSegment: string;
/**
 * Special for letters and create an sdf version of a texture
 * @type {String}
 * @param {vec4f} color final color
 * @return `vec4f`
 */
export const sdfSmooth: string;
/**
 * Creates a square
 * @type {String}
 * @param {vec2f} position center of the square
 * @param {f32} radius how big the square is to a corner
 * @param {f32} feather how soft the edges are
 * @param {f32} rotationRads rotates the whole square
 * @param {vec2f} uv uv coordinates
 * @return `f32`
 */
export const sdfSquare: string;
