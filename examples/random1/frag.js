import { fusin } from 'points/animation';
import { texturePosition } from 'points/image';

const frag = /*wgsl*/`

${fusin}
${texturePosition}

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {


    let startPosition = vec2(0.);
    let texColorCompute = texturePosition(computeTexture, computeTextureSampler, startPosition, uvr, false);


    let d = distance(uvr, vec2(.5 + .1 * fusin(2.), .5  + .1 * fusin(4.123)));
    var c = 1.;
    if(d > .1){
        c = 0.;
    }


    let finalColor:vec4<f32> = vec4(c) + texColorCompute;

    return finalColor;
}
`;

export default frag;
