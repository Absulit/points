import { brightness } from 'points/color';

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
    var pointIndex = i32(GlobalId.y + (GlobalId.x * dims.x));
    var point = textureLoad(image, GlobalId.xy, 0); // image
    // var point = textureLoad(image, GlobalId.yx); // video
    // layers[layerIndex][pointIndex] = point;

    textureStore(outputTex, GlobalId.xy, point);

    //--------------------------------------------------

    // pointIndex = i32(GlobalId.x + (GlobalId.y * dims.y));

    point = textureLoad(image, GlobalId.xy, 0);
    let b = brightness(point);
    let newBrightness = step(.5, b); // if(b > .5){newBrightness = 1.;}

    let quant_error = b - newBrightness;
    let distance = 1;
    let distanceU = u32(distance);
    let distanceF = f32(distance);
    point = vec4(newBrightness);

    textureStore(outputTex, GlobalId.xy, point);


    var rightPoint = textureLoad(image, vec2(GlobalId.x, GlobalId.y + distanceU), 0);
    rightPoint = vec4(brightness(rightPoint) + (.5 * quant_error * params.quantError));

    textureStore(outputTex, vec2(GlobalId.x + distanceU, GlobalId.y), rightPoint);


    var bottomPoint = textureLoad(image, vec2(GlobalId.x, GlobalId.y+distanceU ), 0);
    bottomPoint = vec4(brightness(bottomPoint) + (.5 * quant_error));

    textureStore(outputTex, vec2(GlobalId.x, GlobalId.y+distanceU ), bottomPoint);

    textureStore(outputTex, GlobalId.xy, point);
    storageBarrier();
    // workgroupBarrier();
}
`;

export default compute;
