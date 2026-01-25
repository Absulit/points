import { blur9 } from 'points/effects';
import { texture, texturePosition } from 'points/image';
import { rotateVector } from 'points/math';

const frag = /*wgsl*/`

${texturePosition}
${blur9}
${texture}
${rotateVector}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let flippedUV = vec2f(in.uv.x, 1. - in.uv.y);
    let shadow = textureSampleCompare(depth, imageSamplerCompare, flippedUV, params.dof);

    let texSize = vec2f(textureDimensions(depth, 0));
    let coords = vec2i(flippedUV * texSize);
    let d = textureLoad(depth, coords, 0);
    let visual = pow(d, params.dof * 100);

    let firstPassColor = texture(first_pass, imageSampler, in.uvr, true);

    return blur9(
        first_pass,
        imageSampler,
        vec2(),
        in.uvr,
        vec2f(512), // resolution
        rotateVector(vec2f(2.,0) * visual, 0) // direction
    );
}
`;

export default frag;
