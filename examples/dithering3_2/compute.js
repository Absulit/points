import { brightness } from 'points/color';

const compute = /*wgsl*/`

struct Variable{
    init: i32
}

${brightness}

const distance = 1;
const workgroupSize = 1;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(in: ComputeIn) {
    let GID = in.GID;
    //--------------------------------------------------
    let dims = textureDimensions(image);
    var pointIndex = GID.y + (GID.x * dims.x);

    points[pointIndex] = textureLoad(image, GID.yx, 0); // image
    // points[pointIndex] = textureLoad(image, GID.yx); // video

    //--------------------------------------------------

    pointIndex = GID.x + (GID.y * dims.y);

    let b = brightness(points[pointIndex]);
    let newBrightness = step(.5, b); // if(b > .5){newBrightness = 1.;}

    let quant_error = b - newBrightness;

    points[pointIndex] = vec4(newBrightness);

    let pointIndexC = GID.x + (GID.y + distance) * dims.y;
    let rightPoint = points[pointIndexC];
    points[pointIndexC] = vec4(rightPoint + (.5 * quant_error * params.quantError * 2));


    textureStore(outputTex, GID.xy, points[pointIndex]);
}
`;

export default compute;
