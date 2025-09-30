export const structs = /*wgsl*/`

struct Particle {
    start_position: vec3f,
    position: vec3f,
    rotation: vec3f,
    color: vec4f,
    angle: f32,
    life: f32,
    init: u32,
    speed: f32,
    scale: f32,
    life_limit: f32,
    noise: f32,
}

`;

