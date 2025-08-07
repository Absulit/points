export const structs = /*wgsl*/`

struct RenderParams {
    modelViewProjectionMatrix : mat4x4<f32>,
    right : vec3f,
    up : vec3f
}

struct VertexInput {
    @location(0) position : vec3f,
    @location(1) color : vec4f,
    @location(2) quad_pos : vec2f, // -1..+1
}

struct VertexOutput {
    @builtin(position) position : vec4f,
    @location(0) color : vec4f,
    @location(1) quad_pos : vec2f, // -1..+1
}

struct SimulationParams {
    deltaTime : f32,
    seed : vec4f,
  }

struct Particle {
    position : vec3f,
    lifetime : f32,
    color    : vec4f,
    velocity : vec3f,
}

struct Particles {
    particles : array<Particle>,
}

struct UBO {
    width : u32,
}

struct Buffer {
    weights : array<f32>,
}

`;
