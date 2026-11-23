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
declare const RED: vec4f;
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
declare const GREEN: vec4f;
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
declare const BLUE: vec4f;
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
declare const YELLOW: vec4f;
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
declare const CYAN: vec4f;
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
declare const MAGENTA: vec4f;
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
declare const WHITE: vec4f;
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
declare const BLACK: vec4f;
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
declare const layer: string;
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
declare const layerPremultiplied: string;
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
declare const RGBAFromHSV: string;
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
declare const bloom: string;
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
declare const brightness: string;
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
declare const brightnessB: string;
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
declare const brightnessC: string;
export { BLACK, BLUE, CYAN, GREEN, MAGENTA, RED, RGBAFromHSV, WHITE, YELLOW, bloom, brightness, brightnessB, brightnessC, layer, layerPremultiplied };
