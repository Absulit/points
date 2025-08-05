/**
 * Utilities for audio work.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/audio
 */


/**
 * Average of all the value in sound.data (Sound struct in {@link module:defaultStructs})
 * @param {Sound} sound
 * @returns {f32} average result
 * @example
 * // js
 * import { audioAverage } from 'points/audio';
 * points.setAudio('audio', 'myaudio.ogg', volume, loop, autoplay);
 *
 * // wgsl string
 * ${audioAverage}
 * let value = audioAverage(audio); // audio is the audio Storage name set in Points#setAudio
 */
export const audioAverage = /*wgsl*/`
fn audioAverage(sound:Sound) -> f32 {
    var audioAverage = 0.;
    for (var index = 0; index < i32(params.audioLength); index++) {
        let audioValue = sound.data[index] / 256;
        audioAverage += audioValue;
    }
    return audioAverage / params.audioLength;
}
`;

/**
 * WIP
 * @param {i32} segmentNum
 * @returns {f32}
 */
export const audioAverageSegments = /*wgsl*/`
fn audioAverageSegments(segmentNum:i32) -> f32{
    // arrayLength(&array)
    return .0;
}
`;
