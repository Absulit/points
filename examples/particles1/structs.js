export const structs = /*wgsl*/`

struct Particle {
    start_position: vec2f,
    position: vec2f,
    color: vec4f,
    angle: f32,
    life: f32,
    init: u32,
}

struct Variables {
    init: u32,
}

`;

