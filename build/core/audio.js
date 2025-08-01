/* @ts-self-types="./audio.d.ts" */
/**
 * Utilities for audio work.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/audio
 */

const audioAverage = /*wgsl*/`
fn audioAverage(sound:Sound) -> f32 {
    var audioAverage = 0.;
    for (var index = 0; index < i32(params.audioLength); index++) {
        let audioValue = sound.data[index] / 256;
        audioAverage += audioValue;
    }
    return audioAverage / params.audioLength;
}
`;

const audioAverageSegments = /*wgsl*/`
fn audioAverageSegments(segmentNum:i32) -> f32{
    // arrayLength(&array)
    return .0;
}
`;

export { audioAverage, audioAverageSegments };
