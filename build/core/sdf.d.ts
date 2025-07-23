/**
 * @type {String}
 * Creates a circle
 * @param {vec2f} position center of the circle
 * @param {f32} radius how big the circle is
 * @param {f32} feather how soft the edges are
 * @param {vec2f} uv uv coordinates
 * @return `f32`
 */
export const sdfCircle: string;
/**
 * @type {String}
 * Creates a line with a pixel stroke.
 * @param {vec2f} p1 start of the line
 * @param {vec2f} p2 end of the line
 * @param {f32} pixelStroke width in pixels with an 800 base
 * @param {vec2f} uv uv coordinates
 * @return `f32`
 */
export const sdfLine: string;
/**
 * @type {String}
 * Better than sdfLine to create lines
 * @param {vec2f} p1 start of the line
 * @param {vec2f} p2 end of the line
 * @param {f32} feather how soft the edges are
 * @param {vec2f} uv uv coordinates
 * @return `f32`
 */
export const sdfLine2: string;
export const sdfRectangle: "\n\n";
/**
 * A few signed distance functions
 */
/**
 * @type {String}
 * Function used to create lines. It's a dependency of them.
 * @param {vec2f} p uv
 * @param {vec2f} a point A
 * @param {vec2f>} b point B
 * @return `f32`
 */
export const sdfSegment: string;
/**
 * @type {String}
 * Special for letters and create an sdf version of a texture
 * @param {vec4f} color final color
 * @return `vec4f`
 */
export const sdfSmooth: string;
/**
 * @type {String}
 * Creates a square
 * @param {vec2f} position center of the square
 * @param {f32} radius how big the square is to a corner
 * @param {f32} feather how soft the edges are
 * @param {f32} rotationRads rotates the whole square
 * @param {vec2f} uv uv coordinates
 * @return `f32`
 */
export const sdfSquare: string;
