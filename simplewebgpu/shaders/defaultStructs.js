const defaultStructs = /*wgsl*/`

struct Fragment {
    @builtin(position) Position: vec4<f32>,
    @location(0) Color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: f32,
    @location(3) mouse: vec2<f32>
}
`;

export default defaultStructs;
