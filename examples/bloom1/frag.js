import { texture } from 'points/image';
import { bloom } from 'points/color';
import { PI } from 'points/math';

const frag = /*wgsl*/`

${texture}
${bloom}
${PI}


@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let rgbaImage = texture(image, imageSampler, uvr / params.scale, false);

    let input = rgbaImage.r;
    let bloomVal = bloom(input, 2, params.bloom);
    let rgbaBloom = vec4(bloomVal);


    let finalColor = rgbaImage + rgbaBloom;

    return finalColor;
}
`;

export default frag;
