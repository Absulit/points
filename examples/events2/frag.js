import { sdfCircle } from '../../src/core/sdf.js';
import { WHITE, BLUE, GREEN, RED, YELLOW } from '../../src/core/color.js';

const frag = /*wgsl*/`

${sdfCircle}
${WHITE + RED + GREEN + BLUE + YELLOW}

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,  // relation between params.screenWidth and params.screenHeight
        @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    // < ------------ TWO PULSATING CIRCLES
    var circle1Radius = .01;
    var circle2Radius = .01;

    if(params.time % 1 == 0){
        circle1Radius = .1;
        left_blink.data[0] = 1;
        left_blink.data[1] = 1;
        left_blink.updated = 1;
    }

    if(params.time % 2 == 0){
        circle2Radius = .1;
        right_blink.data[0] = 2;
        right_blink.data[1] = 2;
        right_blink.updated = 1;
    }

    let circleValue1 = sdfCircle(vec2f(.2,.5), circle1Radius, 0., uvr);
    let circleValue2 = sdfCircle(vec2f(.8,.5), circle2Radius, 0., uvr);

    var circle1Color = circleValue1 * WHITE;
    var circle2Color = circleValue2 * WHITE;
    // > ------------ TWO PULSATING CIRCLES

    return circle1Color + circle2Color;
}
`;

export default frag;
