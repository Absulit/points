export { defaultStructs as default };
/**
 * Fragment, Sound, and Event structs.
 * <br>
 * <br>
 * Fragment used in Vertex Shaders.<br>
 * Sound used along with {@link Points#setAudio}<br>
 * Event used along with {@link Points#addEventListener}<br>
 * @module defaultStructs
 */
declare const defaultStructs: "\n\nstruct Fragment {\n    @builtin(position) position: vec4<f32>,\n    @location(0) color: vec4<f32>,\n    @location(1) uv: vec2<f32>,\n    @location(2) ratio: vec2<f32>,\n    @location(3) uvr: vec2<f32>,\n    @location(4) mouse: vec2<f32>\n}\n\nstruct Sound {\n    data: array<f32, 2048>,\n    //play\n    //dataLength\n    //duration\n    //currentPosition\n}\n\nstruct Event {\n    updated: u32,\n    data: array<f32>\n}\n";
