
import { clearMix } from 'points/effects';
const compute = /*wgsl*/`

${clearMix}

const workgroupSize = 1;


@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(in: ComputeIn) {


    var rgba = textureSampleLevel(
        feedbackTexture,
        feedbackSampler,
        vec2f(in.GID.xy),
        0.
    );

    // textureLoad here behaves differently
    // var rgba = textureLoad(feedbackTexture, in.GID.xy, 0);

    rgba = clearMix(rgba, 1.01) + vec4f(1.,0.,0., .5);
    textureStore(outputTex, in.GID.xy, rgba);
}
`;

export default compute;