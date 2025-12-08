import { RED, GREEN, BLUE } from '../../color.js';
import { texture } from '../../image.js';
import { sdfRect } from '../../sdf.js';
import { rotateVector } from '../../math.js';
import { fnusin } from '../../animation.js';


const frag = /*wgsl*/`

${fnusin}
${sdfRect}
${rotateVector}
${texture}
${RED + GREEN + BLUE}


@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let numColumns = 200. *  params.crt_scale;
    let numRows = 200. * params.crt_scale;


    let pixelsWidth = params.screen.x / numColumns;
    let pixelsHeight = params.screen.y / numRows;
    let dx = pixelsWidth * (1. / params.screen.x);
    let dy = pixelsHeight * (1. / params.screen.y);
    var x = 0.;
    // if column is pair then displace by this amount
    if(floor( in.uvr.x / dx) % 2 == 0.){
        x = .5;
    }
    let pixeleduv = vec2(dx*floor( in.uvr.x / dx), dy * floor( in.uvr.y / dy + x));
    let pixeleduvColor = vec4(pixeleduv, 0, 1);

    let subuv = fract(in.uvr * vec2(numColumns, numRows) + vec2(0,x));
    let subuvColor = vec4(subuv, 0, 1);

    // --------- chromatic displacement vector
    let cdv = vec2(params.crt_displacement, 0.);
    let imageColorG = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, pixeleduv, true).g;
    let imageColorR = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, pixeleduv + cdv, true).r;
    let imageColorB = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, pixeleduv - cdv, true).b;

    let bottom_left = vec2(.0, .0);
    let top_right = bottom_left + vec2(.33, 1.);

    let margin = vec2(.01,0.) * 4;
    let margin_v = vec2(.0, .01) * 8;
    var offset = vec2(.33,0);
    let redSlot = RED * imageColorR * sdfRect(margin+margin_v+bottom_left + offset * 0, top_right - margin - margin_v + offset * 0, subuv); // subuv
    let greenSlot = GREEN * imageColorG * sdfRect(margin+margin_v+bottom_left + offset * 1, top_right - margin - margin_v + offset * 1, subuv);
    let blueSlot = BLUE * imageColorB * sdfRect(margin+margin_v+bottom_left + offset * 2, top_right - margin - margin_v + offset * 2, subuv);


    let finalColor = redSlot + greenSlot + blueSlot;

    return finalColor;
}
`;

export default frag;
