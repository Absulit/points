import { fnusin, fusin } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';

const noisecircle1Compute = /*wgsl*/`

${defaultStructs}

${fnusin}
${fusin}

const workgroupSize = 8;

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let utime = params.utime;
    let numPoints = u32(params.numPoints);

    // list of points for the sine wave
    for(var k:u32; k < numPoints; k++){
        let fk = f32(k);
        let point = &points[k];
        (*point).x = fk / params.numPoints;
        (*point).y = sin(  ((*point).x * 32) + utime) * .1;
    }

}
`;

export default noisecircle1Compute;
