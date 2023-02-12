export const RED = /*wgsl*/`
const RED = vec4(1.,0.,0.,1.);
`;

export const GREEN = /*wgsl*/`
const GREEN = vec4(0.,1.,0.,1.);
`;

export const BLUE = /*wgsl*/`
const BLUE = vec4(0.,0.,1.,1.);
`;

export const YELLOW = /*wgsl*/`
const YELLOW = vec4(1.,1.,0.,1.);
`;

export const CYAN = /*wgsl*/`
const CYAN = vec4(0.,1.,1.,1.);
`;

export const MAGENTA = /*wgsl*/`
const MAGENTA = vec4(1.,0.,1.,1.);
`;

export const WHITE = /*wgsl*/`
const WHITE = vec4(1.,1.,1.,1.);
`;

export const BLACK = /*wgsl*/`
const BLACK = vec4(0.,0.,0.,1.);
`;

/**
 * Layers two colors by cropping the color in the back
 * @param {vec4<f32>} back `vec4<f32>`
 * @param {vec4<f32>} front `vec4<f32>`
 * @return `vec4<f32>`
 */
export const layer = /*wgsl*/`
// https://stackoverflow.com/a/24501192/507186
fn layer(back:vec4<f32>, front: vec4<f32>) -> vec4<f32> {
    return front * front.a + back * (1 - front.a);
}
`;

export const RGBAFromHSV = /*wgsl*/`;
fn hsvAux(h:f32, s:f32, v:f32, n:f32) -> f32 {
    let k:f32 = (n + h * 6.) % 6.;
    return v - v * s * max(      min(min(k, 4. - k), 1.), 0.);
};

fn RGBAFromHSV(h:f32, s:f32, v:f32) ->  vec4<f32>{
    return vec4<f32>(hsvAux(h, s, v, 5), hsvAux(h, s, v, 3), hsvAux(h, s, v, 1), 1);
}
`;

/**
 * Compute the FFT (Fast Fourier Transform)
 * @param {f32} input `f32`
 * @param {i32} iterations `i32` 2, two is good
 * @param {f32} intensity `f32` 0..1 a percentage
 */
export const bloom = /*wgsl*/`
fn bloom(input:f32, iterations:i32, intensity:f32) -> f32 {
    var output = 0.;
    let iterationsF32 = f32(iterations);
    for (var k = 0; k < iterations; k++) {
        for (var n = 0; n < iterations; n++) {
            let coef = cos(2.0 * PI * f32(k) * f32(n) / iterationsF32 );
            output += input * coef * intensity;
        }
    }
    return output;
}
`;

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