import { sdfCircle } from 'points/sdf';
import { WHITE, RED, GREEN, YELLOW, layer } from 'points/color';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${sdfCircle}
${layer}
${WHITE}
${RED}
${GREEN}
${YELLOW}
${texture}

const SCALE = 2.;
const segmentNum = 4;

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    if(params.mouseClick == 1.){
        click_event.updated = 1;
        // other actions
        showMessage = 0.;
    }

    let feedbackColor = texture(feedbackTexture, imageSampler, in.uvr * vec2f(1, 1.01), true);


    let subSegmentLength = i32(params.audioLength) / segmentNum;

    for (var index = 0; index < segmentNum ; index++) {
        var audioAverage = 0.;
        for (var index2 = 0; index2 < subSegmentLength; index2++) {
            let audioIndex = index2 * index;

            let audioValue = audio.data[audioIndex] / 256;
            audioAverage += audioValue;
        }
        result[index] = audioAverage / f32(subSegmentLength);
    }

    let center = vec2(.5) * in.ratio;
    let size = .4 * ratio.x;
    let circle1 = sdfCircle(center, result[0] * size, .0, in.uvr) * WHITE;
    let circle2 = sdfCircle(center, result[1] * size, .0, in.uvr) * GREEN;
    let circle3 = sdfCircle(center, result[2] * size, .0, in.uvr) * YELLOW;
    let circle4 = sdfCircle(center, result[3] * size, .0, in.uvr) * RED;

    // click to play message
    let dims = vec2f(textureDimensions(cta, 0));
    // if you are using uvr you have to multiply by ratio
    let imageWidth = dims / params.screen * ratio;
    let halfImageWidth = imageWidth * .5 * SCALE;

    let ctaColor = texture(
        cta,
        imageSampler,
        (in.uvr / SCALE) - (center - halfImageWidth) / SCALE,
        true
    ) * showMessage;

    let layer0 = layer(circle3, circle4);
    let layer1 = layer(circle2, layer0);
    let layer2 = layer(circle1, layer1);
    let layer3 = layer(feedbackColor * .9, layer2);
    let layer4 = layer(layer3, vec4f(ctaColor.rgb, ctaColor.r));

    return layer4;
}
`;

export default frag;
