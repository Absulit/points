import defaultStructs from './defaultStructs.js';

const demo6_textureFrag = /*wgsl*/`

${defaultStructs}

@fragment
fn main(@location(0) Color: vec4<f32>, @location(1) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let utime = params.utime;

    return Color;
}
`;

export default demo6_textureFrag;
