export const structs = /*wgsl*/`

struct FragmentCustom {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,
    @location(3) uvr: vec2f,
    @location(4) mouse: vec2f,
    @location(5) normal: vec3f,
    @location(6) world: vec3f,
    @interpolate(flat) @location(7) id: u32,
    @location(8) shadowPos: vec3f,
    @location(9) fragPos: vec3f,
}

`;

