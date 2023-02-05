const defaultStructs = /*wgsl*/`

struct Fragment {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,
    @location(3) uvr: vec2<f32>,
    @location(4) mouse: vec2<f32>
}
`;

export default defaultStructs;
