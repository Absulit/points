import { sdfCircle } from 'points/sdf';
import { WHITE } from 'points/color';
import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${sdfCircle}
${fnusin}
${WHITE}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
        @location(3) uvr: vec2f,    // uv with aspect ratio corrected
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let f0 = fnusin(1.);
    let f1 = fnusin(2.);

    // < ------------ TWO PULSATING CIRCLES

    if(f0 >= .9999){
        left_blink_data[0] = 11.;
        left_blink_data[1] = 22.;
        left_blink.updated = 1u;
    }

    if(f1 >= .9999){
        right_blink_data[0] = 33.;
        right_blink_data[1] = params.time;
        right_blink.updated = 1u;
    }

    let circleValue1 = sdfCircle(vec2f(.2,.5) * in.ratio, .01 + f0 * .09, 0., uvr);
    let circleValue2 = sdfCircle(vec2f(.8,.5) * in.ratio, .01 + f1 * .09, 0., uvr);

    var circle1Color = circleValue1 * WHITE;
    var circle2Color = circleValue2 * WHITE;
    // > ------------ TWO PULSATING CIRCLES

    return circle1Color + circle2Color;
}
`;

export default frag;
