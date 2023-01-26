import { polar } from '../../src/shaders/defaultFunctions.js';
import defaultStructs from '../../src/shaders/defaultStructs.js';
import { rand } from '../../src/shaders/random.js';

const compute = /*wgsl*/`

${defaultStructs}

struct Variable{
    linesCreated:i32,
    initCalled:i32
}

struct StartPosition{
    position:vec2<f32>,
    prevPoint:vec2<f32>
}

${rand}
${polar}

fn drawCurve(startPositionIndex:i32){
    let startPositionP = &flowfields_startPositions[startPositionIndex];
    for(var numStepsIndex=0; numStepsIndex < i32(params.flowfields_numSteps); numStepsIndex++){
        let mathPoint = polar(params.flowfields_stepLength, (*startPositionP).position.x);
    }

}

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let utime = params.utime;

    _ = flowfields_startPositions[0];
    _ = layers[0];

    if(variables.linesCreated == 0){

        for(var i:i32; i < i32(params.flowfields_lineAmount); i++ ){
            rand();

            let startPositionP = &flowfields_startPositions[0];

            // after calling rand() rand_seed has the vec2
            (*startPositionP).position = rand_seed;
        }


        variables.linesCreated = 1;
    }

    for(var i:i32; i < i32(params.screenWidth * params.screenHeight); i++){
        //let startPosition = flowfields_startPositions[i];
        drawCurve(i);
    }

    //add lines
    for(var i:i32; i < i32(params.flowfields_lineAmount); i++){


    }

}
`;

export default compute;
