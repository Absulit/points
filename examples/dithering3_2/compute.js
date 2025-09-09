import { brightness } from 'points/color';

const compute = /*wgsl*/`

struct Variable{
    init: i32
}

${brightness}

const distance = 1;
const workgroupSize = 1;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    //--------------------------------------------------
    let dims = textureDimensions(image);
    var pointIndex = GlobalId.y + (GlobalId.x * dims.x);

    points[pointIndex] = textureLoad(image, GlobalId.yx, 0); // image
    // points[pointIndex] = textureLoad(image, GlobalId.yx); // video

    //--------------------------------------------------

    pointIndex = GlobalId.x + (GlobalId.y * dims.y);

    let b = brightness(points[pointIndex]);
    let newBrightness = step(.5, b); // if(b > .5){newBrightness = 1.;}

    let quant_error = b - newBrightness;

    points[pointIndex] = vec4(newBrightness);

    let pointIndexC = GlobalId.x + (GlobalId.y + distance) * dims.y;
    let rightPoint = points[pointIndexC];
    points[pointIndexC] = vec4(rightPoint + (.5 * quant_error * params.quantError * 2));


    textureStore(outputTex, GlobalId.xy, points[pointIndex]);
}
`;

export default compute;
