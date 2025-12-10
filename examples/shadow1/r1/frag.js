import { structs } from '../structs.js';
import { blur9 } from 'points/effects';
import { texture } from 'points/image';
import { rotateVector } from 'points/math';

const frag = /*wgsl*/`

${structs}
${texture}
${rotateVector}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {
    let lightUV = in.uvr;
    let lightDepthValue = 1.;
    let shadowDarkness = 1.;

    var finalColor = texture(feedbackTexture, imageSampler, in.uvr, true);

    let lightDepth = textureSampleCompare(depth, shadowSampler, lightUV.xy, lightDepthValue);
    // let lightDepth = textureSample(depth, shadowSampler, lightUV.xy);
    if (lightDepth < 0.5) { // result of compare: 1.0 = lit, 0.0 = shadow (API dependent)
        finalColor *= shadowDarkness;
    }

    return finalColor;
}
`;

export default frag;
