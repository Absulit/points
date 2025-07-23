/* @ts-self-types="./../points.module.d.ts" */
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
