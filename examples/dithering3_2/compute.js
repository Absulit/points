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

    var layerIndex = 0;

    var pointIndex = i32(GlobalId.y + (GlobalId.x * dims.x));

    var point = textureLoad(image, GlobalId.yx, 0); // image
    // var point = textureLoad(image, GlobalId.yx); // video
    layers[layerIndex][pointIndex] = point;

    //--------------------------------------------------

    pointIndex = i32(GlobalId.x + (GlobalId.y * dims.y));

    point = layers[layerIndex][pointIndex];
    let b = brightness(point);
    let newBrightness = step(.5, b); // if(b > .5){newBrightness = 1.;}

    let quant_error = b - newBrightness;

    point = vec4(newBrightness);

    layers[layerIndex][pointIndex] = point;


    let pointIndexC = i32(GlobalId.x + (GlobalId.y+distance) * dims.y);
    var rightPoint = layers[layerIndex][pointIndexC];
    rightPoint = vec4(brightness(rightPoint) + (.5 * quant_error * params.quantError * 2));

    layers[layerIndex][pointIndexC] = rightPoint;



    point = layers[layerIndex][pointIndex];
    textureStore(outputTex, GlobalId.xy, point);
    storageBarrier();
    // workgroupBarrier();
}
`;

export default compute;
