import { PI, rotateVector } from 'points/math';
import { snoise } from 'points/noise2d';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${rotateVector}
${PI}
${snoise}
${texture}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let center = vec2f(.5) * ratio;

    let d = 1 - distance(uvr, center);
    let uvrRotated = rotateVector(
        (uvr - center) / params.scale,
        params.time * .1
    );
    let uvrTwisted = rotateVector(
        uvrRotated,
        params.rotation * 2 * PI * d
    );

    // if(params.displace == 1){displaceValue = params.time;}
    let displaceValue = params.displace * params.time;

    let n = snoise(displaceValue + uvrTwisted) * .5 + .5;
    let n2 = snoise(-displaceValue - uvrTwisted) * .5 + .5;

    let imageColor = texture(
        feedbackTexture,
        imageSampler,
        uvr * vec2(n, n2),
        false
    );

    return imageColor;
}
`;

export default frag;
