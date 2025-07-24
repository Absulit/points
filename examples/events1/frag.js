import { sdfCircle } from 'sdf';
import { WHITE, BLUE, GREEN, RED, YELLOW } from 'color';
import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${sdfCircle}
${fnusin}
${WHITE + RED + GREEN + BLUE + YELLOW}

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
        @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let f0 = fnusin(1.);
    let f1 = fnusin(2.);

    // < ------------ TWO PULSATING CIRCLES

    if(f0 >= .9999){
        left_blink.data[0] = 1.;
        left_blink.data[1] = 1.;
        left_blink.updated = 1u;
    }

    if(f1 >= .9999){
        right_blink.data[0] = 2.;
        right_blink.data[1] = 2.;
        right_blink.updated = 1u;
    }

    let circleValue1 = sdfCircle(vec2f(.2,.5), .01 + f0 * .09, 0., uvr);
    let circleValue2 = sdfCircle(vec2f(.8,.5), .01 + f1 * .09, 0., uvr);

    var circle1Color = circleValue1 * WHITE;
    var circle2Color = circleValue2 * WHITE;
    // > ------------ TWO PULSATING CIRCLES

    return circle1Color + circle2Color;
}
`;

export default frag;
