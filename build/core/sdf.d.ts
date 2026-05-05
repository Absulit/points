/**
 * Creates a circle
 * @type {String}
 * @param {vec2f} position center of the circle
 * @param {f32} radius how big the circle is
 * @param {f32} feather how soft the edges are
 * @param {vec2f} uv uv coordinates
 * @return {f32}
 *
 * @example
 * // js
 * import { sdfCircle } from 'points/sdf';
 *
 * // wgsl string
 * ${sdfCircle}
 * let value = sdfCircle(position, radius, feather, uvr);
 */
export const sdfCircle: string;
/**
 * Creates a line with a pixel stroke.
 * @type {String}
 * @param {vec2f} p1 start of the line
 * @param {vec2f} p2 end of the line
 * @param {f32} pixelStroke width in pixels with an 800 base
 * @param {vec2f} uv uv coordinates
 * @return {f32}
 *
 * @example
 * // js
 * import { sdfLine } from 'points/sdf';
 *
 * // wgsl string
 * ${sdfLine}
 * let value = sdfLine(p1, p2, pixeStroke, uvr);
 */
export const sdfLine: string;
/**
 * Better than sdfLine to create lines
 * @type {String}
 * @param {vec2f} p1 start of the line
 * @param {vec2f} p2 end of the line
 * @param {f32} feather how soft the edges are
 * @param {vec2f} uv uv coordinates
 * @return {f32}
 *
 * @example
 * // js
 * import { sdfLine2 } from 'points/sdf';
 *
 * // wgsl string
 * ${sdfLine2}
 * let value = sdfLine2(p1, p2, feather, uvr);
 */
export const sdfLine2: string;
/**
 * Create a rectangle with two coordinates.
 * @type {String}
 * @param {vec2f} startPoint first coordinate, one corner of the rectangle
 * @param {vec2f} endPoint second coordinate, opposite corner of the rectangle
 * @param {vec2f} uv
 * @return {f32}
 *
 * @example
 * // wgsl string
 * sdfRect(vec2f(), vec2f(1), in.uvr);
 *
 */
export const sdfRect: string;
/**
 * A few signed distance functions.
 * <br>
 * <br>
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
 * @return {f32}
 *
 * @example
 * // js
 * import { sdfSegment } from 'points/sdf';
 *
 * // wgsl string
 * ${sdfSegment}
 * let value = sdfSegment(uv, point1, point2);
 */
export const sdfSegment: string;
/**
 * Special for letters and create an sdf version of a texture
 * @type {String}
 * @param {vec4f} color final color
 * @return {vec4f}
 *
 * @example
 * // js
 * import { sdfSmooth } from 'points/sdf';
 *
 * // wgsl string
 * ${sdfSmooth}
 * let value = sdfSmooth(rgba);
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
 * @return {f32}
 *
 * @example
 * // js
 * import { sdfSquare } from 'points/sdf';
 *
 * // wgsl string
 * ${sdfSquare}
 * let value = sdfSquare(position, radius, feather, rotation, uvr);
 */
export const sdfSquare: string;
