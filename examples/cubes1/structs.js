export const structs = /*wgsl*/`

struct CustomFragment {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,
    @location(3) uvr: vec2f,
    @location(4) mouse: vec2f,
    @location(5) depth: vec4f,
    @location(6) noise: f32,
}

struct Particle {
    position: vec3f,
    rotation: vec3f,
    scale: vec3f,
    color: vec4f,
    noise: f32,
    init: u32,
}

`;

