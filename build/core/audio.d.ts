/**
 * Utilities for audio work.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/audio
 */
export const audioAverage: "\nfn audioAverage(sound:Sound) -> f32 {\n    var audioAverage = 0.;\n    for (var index = 0; index < i32(params.audioLength); index++) {\n        let audioValue = sound.data[index] / 256;\n        audioAverage += audioValue;\n    }\n    return audioAverage / params.audioLength;\n}\n";
export const audioAverageSegments: "\nfn audioAverageSegments(segmentNum:i32) -> f32{\n    // arrayLength(&array)\n    return .0;\n}\n";
