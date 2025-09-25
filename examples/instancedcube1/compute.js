import { structs } from './structs.js';

const compute = /*wgsl*/`

${structs}

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    if(variables.init == 0.){
        // let unit = 1. / 100.;
        var index = 0;

        let step = 1;
        let side = i32( params.side / 2 );
        let sideNegative = -1 * side;


        for (var x = sideNegative; x < side; x+=step) {
            let xF32 = f32(x);
            for (var y = sideNegative; y < side; y+=step) {
                let yF32 = f32(y);
                for (var z = sideNegative; z < side; z+=step) {
                    let zF32 = f32(z);

                    points[index] = vec3( xF32 * UNIT,  yF32 * UNIT,   (zF32 * UNIT)  );
                    index++;
                }
            }
        }

        variables.init = 1.;
    }
}
`;

export default compute;
