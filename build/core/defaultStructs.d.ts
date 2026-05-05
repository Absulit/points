export { defaultStructs as default };
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
declare const defaultStructs: "\n\nstruct ComputeIn {\n    @builtin(global_invocation_id) GID: vec3u,\n    @builtin(workgroup_id) WID: vec3u,\n    @builtin(local_invocation_id) LID: vec3u\n}\n\nstruct VertexIn {\n    @location(0) position:vec4f,\n    @location(1) color:vec4f,\n    @location(2) uv:vec2f,\n    @location(3) normal:vec3f,\n    @location(4) id:u32,       // mesh id\n    @location(5) barycentrics: vec3f,\n    @builtin(vertex_index) vertexIndex: u32,\n    @builtin(instance_index) instanceIndex: u32\n}\n\nstruct FragmentIn {\n    @builtin(position) position: vec4f,\n    @location(0) color: vec4f,\n    @location(1) uv: vec2f,\n    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y\n    @location(3) uvr: vec2f,    // uv with aspect ratio corrected\n    @location(4) mouse: vec2f,\n    @location(5) normal: vec3f,\n    @interpolate(flat) @location(6) id: u32, // mesh or instance id\n    @location(7) barycentrics: vec3f,\n    @location(8) world: vec3f,\n}\n\nstruct Sound {\n    data: array<f32, 2048>,\n    //play\n    //dataLength\n    //duration\n    //currentPosition\n}\n\nstruct Event {\n    updated: u32,\n    // data: array<f32>\n}\n";
