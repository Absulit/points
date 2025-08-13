import { brightness } from 'points/color';

const compute = /*wgsl*/`

struct Variable{
    init: i32
}

${brightness}

const distance = 1u;
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
    if(variables.init == 0){

        let pointIndex = i32(GlobalId.y + (GlobalId.x * dims.x));

        // let point = textureLoad(image, GlobalId.yx, 0); // image
        let point = textureLoad(image, GlobalId.yx); // video
        layers[0][pointIndex] = point;
        layers[1][pointIndex] = point;

        // variables.init = 1;
    }else{
        layerIndex = 1;
    }

    //--------------------------------------------------

    let pointIndex = i32(GlobalId.x + (GlobalId.y * dims.y));

    var point = layers[layerIndex][pointIndex];
    let b = brightness(point);
    let newBrightness = step(.5, b); // if(b > .5){newBrightness = 1.;}

    let quant_error = b - newBrightness;


    point = vec4(newBrightness);

    layers[layerIndex][pointIndex] = point;


    let pointIndexC = i32(GlobalId.x + ((GlobalId.y+distance) * dims.y));
    var rightPoint = layers[layerIndex][pointIndexC];
    rightPoint = vec4(brightness(rightPoint) + (.5 * quant_error * params.quantError * 10));

    layers[layerIndex][pointIndexC] = rightPoint;

    let pointIndexR = i32((GlobalId.y+distance) + (GlobalId.x * dims.x));
    var bottomPoint = layers[layerIndex][pointIndexR];
    bottomPoint = vec4(brightness(bottomPoint) + (.5 * quant_error));

    layers[layerIndex][pointIndexR] = bottomPoint;

    point = layers[layerIndex][pointIndex];
    let positionU = GlobalId.xy;
    textureStore(outputTex, positionU, point);
    // storageBarrier();
    // workgroupBarrier();
}
`;

export default compute;
