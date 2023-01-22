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