import defaultStructs from '../defaultStructs.js';
import { rand } from '../random.js';

const flowfieldsanimatedCompute = /*wgsl*/`

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

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let utime = params.utime;

    _ = flowfields_startPositions[0];

    if(variables.linesCreated == 0){

        for(var i:i32; i < i32(params.flowfields_lineAmount); i++ ){
            rand();

            let startPositionP = &flowfields_startPositions[0];

            // after calling rand() rand_seed has the vec2
            (*startPositionP).position = rand_seed;
        }


        variables.linesCreated = 1;
    }

}
`;

export default flowfieldsanimatedCompute;
