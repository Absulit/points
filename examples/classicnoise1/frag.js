import { fnusin } from 'points/animation';
import { cnoise } from 'points/classicnoise2d';
import { BLUE, GREEN, layer, WHITE } from 'points/color';
import { PI, rotateVector, TAU } from 'points/math';

const frag = /*wgsl*/`

${fnusin}
${cnoise}
${rotateVector}
${PI}
${TAU}
${BLUE}
${WHITE}
${GREEN}
${layer}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let globalScale = .5;
    let n0 = cnoise(
        rotateVector(uvr + params.time * .01, TAU * .25 + params.time * .01) *
        50 * globalScale
    ) * .5 + .5;
    let n1 = cnoise(
        rotateVector(uvr, TAU * .75 + params.time * .03) * 100 * globalScale
    ) * .5 + .5;
    let n2 = cnoise(
        rotateVector(uvr, TAU * .95 + params.time * .04) * 150 * globalScale
    ) * .5 + .5;
    let layer0 = layer(BLUE * n2, WHITE * n1);
    let layer1 = layer(n0 * GREEN, layer0);
    let finalColor = layer(vec4f(0, .5, .5, 1), layer1);

    return finalColor;
}
`;

export default frag;
