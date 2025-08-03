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
 *
 */
export const audioAverageSegments = /*wgsl*/`
fn audioAverageSegments(segmentNum:i32) -> f32{
    // arrayLength(&array)
    return .0;
}
`;
