struct Out {
    @builtin(position) pos: vec4<f32>,
    @location(0) uv: vec2<f32>
};
@stage(vertex)fn main(@location(0) xy: vec2<f32>, @location(1) uv: vec2<f32>) -> Out {
    return Out(vec4<f32>(xy, 0.0, 1.0), uv);
}