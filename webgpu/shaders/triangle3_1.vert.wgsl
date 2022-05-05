struct Fragment {
    @builtin(position) Position: vec4<f32>,
    @location(0) Color: vec4<f32>
}


@stage(vertex)
fn main(@builtin(vertex_index) VertexIndex: u32) -> Fragment {
    var positions = array<vec2<f32>, 3>(
        vec2<f32>(0.0, 0.5),
        vec2<f32>(-0.5, -0.5),
        vec2<f32>(0.5, -0.5)
    );

    var colors = array<vec4<f32>, 3>(
        vec4<f32>(1.0, 0.0, 0.0, 1.0),
        vec4<f32>(0.0, 1.0, 0.0, 1.0),
        vec4<f32>(0.0, 0.0, 1.0, 1.0)
    );

    var output: Fragment;

    output.Position = vec4<f32>(positions[VertexIndex], 0.0, 1.0);
    output.Color = vec4<f32>(colors[VertexIndex]);

    return output;
}
