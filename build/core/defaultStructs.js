/* @ts-self-types="./defaultStructs.d.ts" */
/**
 * The defaultStructs are structs already incorporated onto the shaders you create,
 * so you can call them without import.
 * <br>
 * Fragment, Sound, and Event structs.
 * <br>
 * <br>
 * Fragment used in Vertex Shaders.<br>
 * Sound used along with {@link Points#setAudio}<br>
 * Event used along with {@link Points#addEventListener}<br>
 * @module defaultStructs
 */

const defaultStructs = /*wgsl*/`

struct ComputeIn {
    @builtin(global_invocation_id) GID: vec3u,
    @builtin(workgroup_id) WID: vec3u,
    @builtin(local_invocation_id) LID: vec3u
}

struct VertexIn {
    @location(0) position:vec4f,
    @location(1) color:vec4f,
    @location(2) uv:vec2f,
    @location(3) normal:vec3f,
    @location(4) id:u32,       // mesh id
    @location(5) barycentrics: vec3f,
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
}

struct FragmentIn {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @location(5) normal: vec3f,
    @interpolate(flat) @location(6) id: u32, // mesh or instance id
    @location(7) barycentrics: vec3f,
    @location(8) world: vec3f,
}

struct Sound {
    data: array<f32, 2048>,
    //play
    //dataLength
    //duration
    //currentPosition
}

struct Event {
    updated: u32,
    // data: array<f32>
}
`;

export { defaultStructs as default };
