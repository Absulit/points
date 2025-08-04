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
export const sdfSegment = /*wgsl*/`
fn sdfSegment(p:vec2f, a:vec2f, b:vec2f) -> f32{
    let pa = p-a;
    let ba = b-a;
    let h:f32 = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}
`;

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
export const sdfLine = /*wgsl*/`
fn sdfLine(p1:vec2f, p2:vec2f, pixelStroke:f32, uv:vec2f)->f32{
    let d = sdfSegment(uv, p1, p2);
    var value = 1.0;
    if(d > pixelStroke/800.){
        value = 0.;
    }
    return value;
}
`;

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
export const sdfCircle = /*wgsl*/`
fn sdfCircle(position:vec2f, radius: f32, feather: f32, uv:vec2f) -> f32 {
    let d = distance(uv, position);
    let st = 1. - smoothstep(radius, radius + feather, d);
    return st;
}
`;

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
export const sdfSquare = /*wgsl*/`
fn sdfSquare(position:vec2f, radius:f32, feather:f32, rotationRads: f32, uv:vec2f) -> f32 {
    let positionRotated = rotateVector(position, rotationRads);
    let uvRotated = rotateVector(uv, rotationRads);

    var d = distance(uvRotated.x,  positionRotated.x );
    var s = smoothstep(radius, radius + feather,  d);

    d = distance(uvRotated.y,  positionRotated.y);
    s += smoothstep(radius, radius + feather,  d);
    s = clamp(0., 1., s);
    return 1-s;
}
`;

// export const sdfRectangle = /*wgsl*/`
// `;


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
export const sdfLine2 = /*wgsl*/`
fn sdfLine2(p1:vec2f, p2:vec2f, feather:f32, uv:vec2f)->f32{
    let d = sdfSegment(uv, p1, p2);
    var s = smoothstep(0, feather,  d);
    return 1-s;
}
`;

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
export const sdfSmooth = /*wgsl*/`
fn sdfSmooth(color:vec4<f32>) -> vec4<f32> {
    var finalColor = color;
    var spread = fwidth(finalColor.a);
    spread = max(spread * .75, .001);
    finalColor.a = smoothstep(.5 - spread, .5 + spread, finalColor.a);

    // if(finalColor.a <= 0.){
    //     discard;
    // }
    return finalColor;
}
`;
