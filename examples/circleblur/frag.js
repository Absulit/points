import { fusin } from 'points/animation';
import { texture } from 'points/image';

const frag = /*wgsl*/`

struct Particle{
    x: f32,
    y: f32
}

${fusin}
${texture}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let texColor = texture(feedbackTexture, feedbackSampler, uvr, false);
    let texColor2 = texture(feedbackTexture, feedbackSampler, uvr + vec2(-.001,1), false);
    let texColor3 = texture(feedbackTexture, feedbackSampler, uvr + vec2(.001,1), false);

    let texColorCompute = texture(computeTexture, feedbackSampler, uvr, false);

    let d = distance(uvr, vec2(.5 + .1 * fusin(2.), .5  + .1 * fusin(4.123)) * ratio);
    let c = step(d, .1); // if(d > .1){c = 0.;}

    let decayR =  texColor.r * .9 * texColor2.r;
    let decayG =  texColor.g * .9;
    let decayB =  texColor.b * .9 * texColor3.b;
    let decayA =  texColor.a * .9;

    var finalColor:vec4f = vec4(uv.x * c, uv.y * c, c, 1);
    finalColor += vec4(decayR, decayG, decayB, 1);
    finalColor += texColorCompute;

    return finalColor;
}
`;

export default frag;
