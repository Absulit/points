import { brightness } from '../../src/core/color.js';

const compute = /*wgsl*/`

struct Variable{
    init: i32
}

${brightness}

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

        var point = textureLoad(image, GlobalId.yx, 0); // image
        // var point = textureLoad(image, GlobalId.yx); // video
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
    var newBrightness = 0.;
    if(b > .5){
        newBrightness = 1.;
    }

    let quant_error = b - newBrightness;
    let distance = 1;
    let distanceU = u32(distance);
    let distanceF = f32(distance);
    point = vec4(newBrightness);

    let pointP = &layers[layerIndex][pointIndex];
    (*pointP) = point;


    let pointIndexC = i32(GlobalId.x + ((GlobalId.y+distanceU) * dims.y));
    var rightPoint = layers[layerIndex][pointIndexC];
    rightPoint = vec4(brightness(rightPoint) + (.5 * quant_error * params.sliderB));

    let pointPC = &layers[layerIndex][pointIndexC];
    (*pointPC) = rightPoint;


    let pointIndexR = i32((GlobalId.y+distanceU) + (GlobalId.x * dims.x));
    var bottomPoint = layers[layerIndex][pointIndexR];
    bottomPoint = vec4(brightness(bottomPoint) + (.5 * quant_error));

    let pointPR = &layers[layerIndex][pointIndexR];
    (*pointPR) = bottomPoint;

    point = layers[layerIndex][pointIndex];
    let positionU = GlobalId.xy;
    textureStore(outputTex, positionU, point);
    storageBarrier();
    // workgroupBarrier();
}
`;

export default compute;
