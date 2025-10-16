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
declare const defaultStructs: "\n\nstruct Fragment {\n    @builtin(position) position: vec4f,\n    @location(0) color: vec4f,\n    @location(1) uv: vec2f,\n    @location(2) ratio: vec2f,\n    @location(3) uvr: vec2f,\n    @location(4) mouse: vec2f,\n    @location(5) normal: vec3f,\n    @interpolate(flat) @location(6) id: u32\n}\n\nstruct Sound {\n    data: array<f32, 2048>,\n    //play\n    //dataLength\n    //duration\n    //currentPosition\n}\n\nstruct Event {\n    updated: u32,\n    // data: array<f32>\n}\n";
