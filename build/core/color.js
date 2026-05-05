/* @ts-self-types="./color.d.ts" */
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
const RED = /*wgsl*/`
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
const GREEN = /*wgsl*/`
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
const BLUE = /*wgsl*/`
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
const YELLOW = /*wgsl*/`
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
const CYAN = /*wgsl*/`
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
const MAGENTA = /*wgsl*/`
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
const WHITE = /*wgsl*/`
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
const BLACK = /*wgsl*/`
const BLACK = vec4(0.,0.,0.,1.);
`;

/**
 * Layers two colors by cropping the color in the back,
 * based on the alpha value.
 * @type {String}
 * @param {vec4f} back `vec4f`
 * @param {vec4f} front `vec4f`
 * @returns {vec4f}
 * @example
 * // js
 * import { layer } from 'points/color';
 *
 * // wgsl string
 * ${layer}
 *
 * let rgbaImage1 = texture(image1, imageSampler, uvr, true);
 * let rgbaImage2 = texture(image2, imageSampler, uvr, true);
 * let rgbaImage3 = texture(image3, imageSampler, uvr, true);
 *
 * var finalColor:vec4f = layer(rgbaImage2, rgbaImage3);
 * finalColor = layer(rgbaImage1, finalColor);
 */
const layer = /*wgsl*/`
// https://stackoverflow.com/a/24501192/507186
// math has been corrected from the stackoverflow method
// to avoid a black like/ring
fn layer(back:vec4f, front: vec4f) -> vec4f {
    let rgb = front.rgb * front.a + back.rgb * (1. - front.a);
    let a = front.a + back.a * (1. - front.a);
    return vec4f(rgb, a);
}
`;

/**
 * Same as layer but with premultiplied alpha.
 * The consideration here is that the back param already has the alpha applied.
 * Layers two colors by cropping the color in the back,
 * based on the alpha value.
 * @type {String}
 * @param {vec4f} back `vec4f`
 * @param {vec4f} front `vec4f`
 * @returns {vec4f}
 * @example
 * // js
 * import { layerPremultiplied } from 'points/color';
 *
 * // wgsl string
 * ${layer}
 *
 * let rgbaImage1 = texture(image1, imageSampler, uvr, true);
 * let rgbaImage2 = texture(image2, imageSampler, uvr, true);
 * let rgbaImage3 = texture(image3, imageSampler, uvr, true);
 *
 * var finalColor:vec4f = layerPremultiplied(rgbaImage2, rgbaImage3);
 * finalColor = layerPremultiplied(rgbaImage1, finalColor);
 */
const layerPremultiplied = /*wgsl*/`
fn layerPremultiplied(back: vec4f, front: vec4f) -> vec4f {
    let out_a = front.a + back.a * (1. - front.a);
    let out_rgb = (front.rgb * front.a) + (back.rgb * back.a * (1. - front.a));
    return vec4f(out_rgb, out_a);
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
 * let value = RGBAFromHSV(h,s,v,n);
 */
const RGBAFromHSV = /*wgsl*/`
fn hsvAux(h:f32, s:f32, v:f32, n:f32) -> f32 {
    let k:f32 = (n + h * 6.) % 6.;
    return v - v * s * max(min(min(k, 4. - k), 1.), 0.);
};

fn RGBAFromHSV(h:f32, s:f32, v:f32) ->  vec4f{
    return vec4f(hsvAux(h, s, v, 5.), hsvAux(h, s, v, 3.), hsvAux(h, s, v, 1.), 1.);
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
const bloom = /*wgsl*/`
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
const brightness = /*wgsl*/`
fn brightness(color:vec4f) -> f32 {
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
const brightnessB = /*wgsl*/`
fn brightnessB(color:vec4f) -> f32 {
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
const brightnessC = /*wgsl*/`
fn brightnessC(color:vec4f) -> f32 {
    return (0.2126 * pow(color.r, 2.)) + (0.7152 * pow(color.g, 2.)) + (0.0722 * pow(color.b, 2.));
}
`;

export { BLACK, BLUE, CYAN, GREEN, MAGENTA, RED, RGBAFromHSV, WHITE, YELLOW, bloom, brightness, brightnessB, brightnessC, layer, layerPremultiplied };
