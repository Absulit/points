const RED = /*wgsl*/`
const RED = vec4(1.,0.,0.,1.);
`;

const GREEN = /*wgsl*/`
const GREEN = vec4(0.,1.,0.,1.);
`;

const BLUE = /*wgsl*/`
const BLUE = vec4(0.,0.,1.,1.);
`;

const YELLOW = /*wgsl*/`
const YELLOW = vec4(1.,1.,0.,1.);
`;

const CYAN = /*wgsl*/`
const CYAN = vec4(0.,1.,1.,1.);
`;

const MAGENTA = /*wgsl*/`
const MAGENTA = vec4(1.,0.,1.,1.);
`;

const WHITE = /*wgsl*/`
const WHITE = vec4(1.,1.,1.,1.);
`;

const BLACK = /*wgsl*/`
const BLACK = vec4(0.,0.,0.,1.);
`;

/**
 * Layers two colors by cropping the color in the back
 * @param {vec4<f32>} back `vec4<f32>`
 * @param {vec4<f32>} front `vec4<f32>`
 * @return `vec4<f32>`
 */
const layer = /*wgsl*/`
// https://stackoverflow.com/a/24501192/507186
fn layer(back:vec4<f32>, front: vec4<f32>) -> vec4<f32> {
    return front * front.a + back * (1. - front.a);
}
`;

/**
 * @type {string}
 * Creates a rgba `vec4f` from an hsv color value
 * @param {f32} h hue
 * @param {f32} s saturation
 * @param {f32} v value
 * @return `vec4f`
 */
const RGBAFromHSV = /*wgsl*/`
fn hsvAux(h:f32, s:f32, v:f32, n:f32) -> f32 {
    let k:f32 = (n + h * 6.) % 6.;
    return v - v * s * max(min(min(k, 4. - k), 1.), 0.);
};

fn RGBAFromHSV(h:f32, s:f32, v:f32) ->  vec4<f32>{
    return vec4<f32>(hsvAux(h, s, v, 5.), hsvAux(h, s, v, 3.), hsvAux(h, s, v, 1.), 1.);
}
`;

/**
 * @type {String}
 * Compute the FFT (Fast Fourier Transform)
 * @param {f32} input `f32`
 * @param {i32} iterations `i32` 2, two is good
 * @param {f32} intensity `f32` 0..1 a percentage
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
 * @type {String}
 * Returns the perceived brightness of a color by the eye
 * # Standard
 * LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)
 * @param {vec4f} color
 * @return `f32`
 */
const brightness = /*wgsl*/`
fn brightness(color:vec4<f32>) -> f32 {
    // #Standard
    // LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)
    // #Percieved A
    // LuminanceB = (0.299*R + 0.587*G + 0.114*B)
    // #Perceived B, slower to calculate
    // LuminanceC = sqrt(0.299*(R**2) + 0.587*(G**2) + 0.114*(B**2))
    return (0.2126 * color.r) + (0.7152 * color.g) + (0.0722 * color.b);
}
`;

/**
 * @type {String}
 * Returns the perceived brightness of a color by the eye
 * # Percieved A
 * LuminanceB = (0.299*R + 0.587*G + 0.114*B)
 * @param {vec4f} color
 * @return `f32`
 */
const brightnessB = /*wgsl*/`
fn brightnessB(color:vec4<f32>) -> f32 {
    return (0.299 * color.r) + (0.587 * color.g) + (0.114 * color.b);
}
`;

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
const brightnessC = /*wgsl*/`
fn brightnessC(color:vec4<f32>) -> f32 {
    return (0.2126 * pow(color.r, 2.)) + (0.7152 * pow(color.g, 2.)) + (0.0722 * pow(color.b, 2.));
}
`;

export { BLACK, BLUE, CYAN, GREEN, MAGENTA, RED, RGBAFromHSV, WHITE, YELLOW, bloom, brightness, brightnessB, brightnessC, layer };
