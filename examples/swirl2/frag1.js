import { fnusin } from 'points/animation';
import { PI, rotateVector } from 'math';
import { snoise } from 'points/noise2d';
import { sdfCircle } from 'sdf';
import { texturePosition } from 'points/image';

const frag = /*wgsl*/`

${fnusin}
${sdfCircle}
${rotateVector}
${PI}
${snoise}
${texturePosition}

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
    let uvrRotated = rotateVector(  (uvr - center) / params.scale, params.time * .1);
    let uvrTwisted = rotateVector(uvrRotated, params.rotation * 2 * PI * d);

    var displaceValue = 0.;
    if(params.displace == 1){
        displaceValue = params.time;
    }

    let n = snoise(displaceValue + uvrTwisted ) * .5 + .5;
    let n2 = snoise(-displaceValue - uvrTwisted ) * .5 + .5;

    let imageColor = texturePosition(feedbackTexture, imageSampler, vec2f(), uvr * vec2(n,n2) , false);

    return imageColor;
}
`;

export default frag;
