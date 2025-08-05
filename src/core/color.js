/**
 * A few color constants and wgsl methods to work with colors.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/color
 */

/**
 * RED color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { RED } from 'points/color';
 *
 * // wgsl string
 * ${RED}
 * let value = RED * vec4f(.5);
 */
export const RED = /*wgsl*/`
const RED = vec4(1.,0.,0.,1.);
`;

/**
 * GREEN color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { GREEN } from 'points/color';
 *
 * // wgsl string
 * ${GREEN}
 * let value = GREEN * vec4f(.5);
 */
export const GREEN = /*wgsl*/`
const GREEN = vec4(0.,1.,0.,1.);
`;

/**
 * BLUE color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { BLUE } from 'points/color';
 *
 * // wgsl string
 * ${BLUE}
 * let value = BLUE * vec4f(.5);
 */
export const BLUE = /*wgsl*/`
const BLUE = vec4(0.,0.,1.,1.);
`;

/**
 * YELLOW color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { YELLOW } from 'points/color';
 *
 * // wgsl string
 * ${YELLOW}
 * let value = YELLOW * vec4f(.5);
 */
export const YELLOW = /*wgsl*/`
const YELLOW = vec4(1.,1.,0.,1.);
`;

/**
 * CYAN color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { CYAN } from 'points/color';
 *
 * // wgsl string
 * ${CYAN}
 * let value = CYAN * vec4f(.5);
 */
export const CYAN = /*wgsl*/`
const CYAN = vec4(0.,1.,1.,1.);
`;

/**
 * MAGENTA color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { MAGENTA } from 'points/color';
 *
 * // wgsl string
 * ${MAGENTA}
 * let value = MAGENTA * vec4f(.5);
 */
export const MAGENTA = /*wgsl*/`
const MAGENTA = vec4(1.,0.,1.,1.);
`;

/**
 * WHITE color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { WHITE } from 'points/color';
 *
 * // wgsl string
 * ${WHITE}
 * let value = WHITE * vec4f(.5);
 */
export const WHITE = /*wgsl*/`
const WHITE = vec4(1.,1.,1.,1.);
`;

/**
 * BLACK color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { BLACK } from 'points/color';
 *
 * // wgsl string
 * ${BLACK}
 * let value = BLACK * vec4f(.5);
 *
 */
export const BLACK = /*wgsl*/`
const BLACK = vec4(0.,0.,0.,1.);
`;

/**
 * Layers two colors by cropping the color in the back,
 * based on the alpha value.
 * @param {vec4f} back `vec4f`
 * @param {vec4f} front `vec4f`
 * @returns {vec4f}
 * @example
 * // js
 * import { layer } from 'points/color';
 *
 * // wgsl string
 * ${layer}
 * let value = RED * vec4f(.5);
 */
export const layer = /*wgsl*/`
// https://stackoverflow.com/a/24501192/507186
fn layer(back:vec4<f32>, front: vec4<f32>) -> vec4<f32> {
    return front * front.a + back * (1. - front.a);
}
`;

/**
 * Creates a rgba `vec4f` from an hsv color value
 * @type {string}
 * @param {f32} h hue
 * @param {f32} s saturation
 * @param {f32} v value
 * @returns {vec4f}
 *
 * @example
 * // js
 * import { RGBAFromHSV } from 'points/color';
 *
 * // wgsl string
 * ${RGBAFromHSV}
 * let value = layer(h,s,v,n);
 */
export const RGBAFromHSV = /*wgsl*/`
fn hsvAux(h:f32, s:f32, v:f32, n:f32) -> f32 {
    let k:f32 = (n + h * 6.) % 6.;
    return v - v * s * max(min(min(k, 4. - k), 1.), 0.);
};

fn RGBAFromHSV(h:f32, s:f32, v:f32) ->  vec4<f32>{
    return vec4<f32>(hsvAux(h, s, v, 5.), hsvAux(h, s, v, 3.), hsvAux(h, s, v, 1.), 1.);
}
`;

/**
 * Compute the FFT (Fast Fourier Transform)
 * @type {String}
 * @param {f32} input `f32`
 * @param {i32} iterations `i32` 2, two is good
 * @param {f32} intensity `f32` 0..1 a percentage
 * @returns {f32}
 *
 * @example
 * // js
 * import { bloom } from 'points/color';
 *
 * // wgsl string
 * ${bloom}
 * let value = bloom(input, iterations, intensity);
 */
export const bloom = /*wgsl*/`
fn bloom(input:f32, iterations:i32, intensity:f32) -> f32 {
    var output = 0.;
    let iterationsF32 = f32(iterations);
    for (var k = 0; k < iterations; k++) {
        let kf32 = f32(k);
        for (var n = 0; n < iterations; n++) {
            let coef = cos(2. * PI * kf32 * f32(n) / iterationsF32 );
            output += input * coef * intensity;
        }
    }
    return output;
}
`;


/**
 * Returns the perceived brightness of a color by the eye.<br>
 * // Standard<br>
 * `LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)`
 * @type {String}
 * @param {vec4f} color
 * @returns {f32}
 * @example
 * // js
 * import { brightness } from 'points/color';
 *
 * // wgsl string
 * ${brightness}
 * let value = brightness(rgba);
 */
export const brightness = /*wgsl*/`
fn brightness(color:vec4<f32>) -> f32 {
    // // Standard
    // LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)
    // // Percieved A
    // LuminanceB = (0.299*R + 0.587*G + 0.114*B)
    // // Perceived B, slower to calculate
    // LuminanceC = sqrt(0.299*(R**2) + 0.587*(G**2) + 0.114*(B**2))
    return (0.2126 * color.r) + (0.7152 * color.g) + (0.0722 * color.b);
}
`;

/**
 * Returns the perceived brightness of a color by the eye.<br>
 * // Percieved A<br>
 * `LuminanceB = (0.299*R + 0.587*G + 0.114*B)`
 * @type {String}
 * @param {vec4f} color
 * @returns {f32}
 *
 * @example
 * // js
 * import { brightnessB } from 'points/color';
 *
 * // wgsl string
 * ${brightnessB}
 * let value = brightnessB(rgba);
 */
export const brightnessB = /*wgsl*/`
fn brightnessB(color:vec4<f32>) -> f32 {
    return (0.299 * color.r) + (0.587 * color.g) + (0.114 * color.b);
}
`;

/**
 * Returns the perceived brightness of a color by the eye.<br>
 * // Percieved B<br>
 * slower to calculate<br>
 * `LuminanceC = sqrt(0.299*(R**2) + 0.587*(G**2) + 0.114*(B**2))`
 * @type {String}
 * @param {vec4f} color
 * @returns {f32}`
 *
 * @example
 * // js
 * import { brightnessC } from 'points/color';
 *
 * // wgsl string
 * ${brightnessC}
 * let value = brightnessC(rgba);
 */
export const brightnessC = /*wgsl*/`
fn brightnessC(color:vec4<f32>) -> f32 {
    return (0.2126 * pow(color.r, 2.)) + (0.7152 * pow(color.g, 2.)) + (0.0722 * pow(color.b, 2.));
}
`;
