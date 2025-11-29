import { brightness } from 'points/color';

const compute = /*wgsl*/`

${brightness}

const distance = 1u;
const workgroupSize = 1;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(in: ComputeIn) {
    //--------------------------------------------------
    let dims = textureDimensions(image);
    var pointIndex = in.GID.y + (in.GID.x * dims.x);
    // points[pointIndex] = textureLoad(image, in.GID.yx, 0); // image
    points[pointIndex] = textureLoad(image, in.GID.yx); // video

    //--------------------------------------------------

    pointIndex = in.GID.x + (in.GID.y * dims.y);

    let b = brightness(points[pointIndex]);
    let newBrightness = step(.5, b); // if(b > .5){newBrightness = 1.;}
    let quant_error = b - newBrightness;


    points[pointIndex] = vec4(newBrightness);

    let pointIndexC = in.GID.x + (in.GID.y + distance) * dims.y;
    let rightPoint = points[pointIndexC];
    points[pointIndexC] = vec4(brightness(rightPoint) + (.5 * quant_error * params.quantError * 2));

    textureStore(outputTex, in.GID.xy, points[pointIndex]);
}
`;

export default compute;
