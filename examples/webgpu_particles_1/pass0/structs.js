export const structs = /*wgsl*/`

struct RenderParams {
    modelViewProjectionMatrix : mat4x4<f32>,
    right : vec3<f32>,
    up : vec3<f32>
}

struct VertexInput {
    @location(0) position : vec3<f32>,
    @location(1) color : vec4<f32>,
    @location(2) quad_pos : vec2<f32>, // -1..+1
}

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) color : vec4<f32>,
    @location(1) quad_pos : vec2<f32>, // -1..+1
}

`;