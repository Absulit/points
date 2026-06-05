export const structs = /*wgsl*/`

struct Particle {
    position: vec3f,
    rotation: vec3f,
    scale: vec3f,
    color: vec4f,
    noise: f32,
    init: u32,
}

struct Triangle {
    a: vec4f,
    b: vec4f,
    c: vec4f,
}

`;

