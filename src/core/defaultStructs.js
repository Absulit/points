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

struct Fragment {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,
    @location(3) uvr: vec2f,
    @location(4) mouse: vec2f
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

export default defaultStructs;
