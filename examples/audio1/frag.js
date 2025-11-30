import { texture } from "points/image";

const frag = /*wgsl*/`

${texture}

const SCALE = 2.;

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let audioX = audio.data[u32(in.uvr.x * params.audioLength)] / 256;

    if(params.mouseClick == 1.){
        click_event.updated = 1;
        // other actions
        showMessage = 1.;
    }

    // click to play message
    let center = vec2f(.5) * in.ratio;

    let dims = vec2f(textureDimensions(cta, 0));
    // if you are using uvr you have to multiply by ratio
    let imageWidth = dims / params.screen * in.ratio;
    let halfImageWidth = imageWidth * .5 * SCALE;

    let ctaColor = texture(
        cta,
        imageSampler,
        (in.uvr / SCALE) - (center - halfImageWidth) / SCALE,
        true
    );

    return vec4f(audioX, 0, 0, 1) + ctaColor * (1 - showMessage);
}
`;

export default frag;
