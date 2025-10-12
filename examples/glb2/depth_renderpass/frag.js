import { fnusin } from 'points/animation';
import { structs } from '../structs.js';
import { blur9 } from 'points/effects';
import { texture, texturePosition } from 'points/image';
import { rotateVector } from 'points/math';

const frag = /*wgsl*/`

${fnusin}
${structs}
${texturePosition}
${blur9}
${texture}
${rotateVector}


@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let flippedUV = vec2f(uv.x, 1. - uv.y);
    let shadow = textureSampleCompare(depth, imageSamplerCompare, flippedUV, params.dof);

    let texSize = vec2f(textureDimensions(depth, 0));
    let coords = vec2i(flippedUV * texSize);
    let d = textureLoad(depth, coords, 0);
    let visual = pow(d, params.dof * 100);

    let firstPassColor = texture(first_pass, imageSampler, uvr, true);

    return blur9(
        first_pass,
        imageSampler,
        vec2(),
        uvr,
        vec2f(100), // resolution
        rotateVector(vec2f(1.) * visual, 0) // direction
    );


    // return vec4f(firstPassColor + visual);
}
`;

export default frag;
