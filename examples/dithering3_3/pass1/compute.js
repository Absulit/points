import { brightness } from 'points/color';

const compute = /*wgsl*/`

${brightness}

const distance = 1;

fn newB(point:vec4f) -> f32 {
    let b = brightness(point);
    return step(.5, b); // if(b > .5){newBrightness = 1.;}
}

const workgroupSize = 1;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {

}
`;

export default compute;
