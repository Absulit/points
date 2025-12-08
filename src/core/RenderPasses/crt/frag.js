import { texture } from '../../image.js';

import { RED, GREEN, BLUE } from '../../color.js';
import { texturePosition } from '../../image.js';
import { showDebugFrame } from '../../debug.js';
import { sdfLine, sdfSegment, sdfSquare } from '../../sdf.js';
import { rotateVector } from '../../math.js';
import { fnusin } from '../../animation.js';


const frag = /*wgsl*/`

${fnusin}
${sdfSquare}
${rotateVector}
${texturePosition}
${showDebugFrame + sdfLine + sdfSegment}
${RED + GREEN + BLUE}

fn sdfRect(startPoint:vec2<f32>, endPoint:vec2<f32>, uv:vec2<f32>) -> f32 {
    var value = 0.;
    if(
        (startPoint.x < uv.x) &&
        (startPoint.y < uv.y) &&
        (uv.x < endPoint.x) &&
        (uv.y < endPoint.y)
        ){
        value = 1.;
    }
    value = smoothstep(0, .5,  value);

    return value;
}
@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let numColumns = 200. *  params.crt_sliderB;
    let numRows = 200. * params.crt_sliderB;


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
    // let cdv = vec2(.010, 0.);
    // let cdv = vec2(-.006, 0.);
    let cdv = vec2(params.crt_sliderC, 0.);
    // let cdv = vec2(0., 0.);
    let imageColorG = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * in.ratio, pixeleduv / params.crt_sliderA / 20, true).g;
    let imageColorR = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * in.ratio, pixeleduv / params.crt_sliderA / 20 + cdv, true).r;
    let imageColorB = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * in.ratio, pixeleduv / params.crt_sliderA / 20 - cdv, true).b;



    let bottom_left = vec2(.0, .0);
    let top_right = bottom_left + vec2(.33, 1.);

    let margin = vec2(.01,0.) * 4;
    let margin_v = vec2(.0, .01) * 8;
    var offset = vec2(.33,0);
    let redSlot = RED * imageColorR * sdfRect(margin+margin_v+bottom_left + offset * 0, top_right - margin - margin_v + offset * 0, subuv); // subuv
    let greenSlot = GREEN * imageColorG * sdfRect(margin+margin_v+bottom_left + offset * 1, top_right - margin - margin_v + offset * 1, subuv);
    let blueSlot = BLUE * imageColorB * sdfRect(margin+margin_v+bottom_left + offset * 2, top_right - margin - margin_v + offset * 2, subuv);

    // let rect = sdfRect(vec2(0.,0.1) * in.ratio, vec2(.33,.9) * in.ratio, uvr);

    let finalColor:vec4<f32> = redSlot + greenSlot + blueSlot;

    return finalColor + showDebugFrame(RED, in.uvr);
}
`;

export default frag;
