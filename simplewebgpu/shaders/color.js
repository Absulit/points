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
