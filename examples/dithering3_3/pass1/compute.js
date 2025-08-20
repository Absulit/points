import { brightness } from 'points/color';

const compute = /*wgsl*/`

${brightness}

const distance = 1;
const workgroupSize = 1;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let quant_error = textureLoad(quantErrorRead, GlobalId.xy, 0);;

    let rightPosition = GlobalId.xy + vec2(distance, 0);
    var rightPoint = textureLoad(brightnessRead, rightPosition, 0); // image
    rightPoint = vec4(rightPoint.r + (.5 * quant_error * params.quantError * 2));
    textureStore(finalWrite, rightPosition, rightPoint);

    let leftPosition = GlobalId.xy + vec2(0, distance);
    var leftPoint = textureLoad(brightnessRead, leftPosition, 0); // image
    leftPoint = vec4(leftPoint.r + (.5 * quant_error * params.quantError * 2));
    textureStore(finalWrite, leftPosition, leftPoint);


}
`;

export default compute;
