export const BLACK: "\nconst BLACK = vec4(0.,0.,0.,1.);\n";
export const BLUE: "\nconst BLUE = vec4(0.,0.,1.,1.);\n";
export const CYAN: "\nconst CYAN = vec4(0.,1.,1.,1.);\n";
export const GREEN: "\nconst GREEN = vec4(0.,1.,0.,1.);\n";
export const MAGENTA: "\nconst MAGENTA = vec4(1.,0.,1.,1.);\n";
export const RED: "\nconst RED = vec4(1.,0.,0.,1.);\n";
/**
 * @type {string}
 * Creates a rgba `vec4f` from an hsv color value
 * @param {f32} h hue
 * @param {f32} s saturation
 * @param {f32} v value
 * @return `vec4f`
 */
export const RGBAFromHSV: string;
export const WHITE: "\nconst WHITE = vec4(1.,1.,1.,1.);\n";
export const YELLOW: "\nconst YELLOW = vec4(1.,1.,0.,1.);\n";
/**
 * @type {String}
 * Compute the FFT (Fast Fourier Transform)
 * @param {f32} input `f32`
 * @param {i32} iterations `i32` 2, two is good
 * @param {f32} intensity `f32` 0..1 a percentage
 */
export const bloom: string;
/**
 * @type {String}
 * Returns the perceived brightness of a color by the eye
 * # Standard
 * LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)
 * @param {vec4f} color
 * @return `f32`
 */
export const brightness: string;
/**
 * @type {String}
 * Returns the perceived brightness of a color by the eye
 * # Percieved A
 * LuminanceB = (0.299*R + 0.587*G + 0.114*B)
 * @param {vec4f} color
 * @return `f32`
 */
export const brightnessB: string;
/**
 * @type {String}
 * Returns the perceived brightness of a color by the eye
 * # Percieved B
 * slower to calculate
 *
 * LuminanceC = sqrt(0.299*(R**2) + 0.587*(G**2) + 0.114*(B**2))
 * @param {vec4f} color
 * @return `f32`
 */
export const brightnessC: string;
/**
 * Layers two colors by cropping the color in the back
 * @param {vec4<f32>} back `vec4<f32>`
 * @param {vec4<f32>} front `vec4<f32>`
 * @return `vec4<f32>`
 */
export const layer: "\n// https://stackoverflow.com/a/24501192/507186\nfn layer(back:vec4<f32>, front: vec4<f32>) -> vec4<f32> {\n    return front * front.a + back * (1. - front.a);\n}\n";
