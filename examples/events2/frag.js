import { sdfCircle } from '../../src/core/sdf.js';
import { WHITE, BLUE, GREEN, RED, YELLOW } from '../../src/core/color.js';

const frag = /*wgsl*/`

struct Variable{
    init: f32,
    circleRadius:f32,
    circlePosition:vec2<f32>
}

${sdfCircle}
${WHITE + RED + GREEN + BLUE + YELLOW}

// fn resetEvent() {
//     let eventLength = arrayLength(&event);
//     for (var index = 0u; index < eventLength ; index++) {
//         event[index] = 0;
//     }
// }

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,  // relation between params.screenWidth and params.screenHeight
        @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    if(variables.init == 0){
        variables.circleRadius = .1;
        variables.circlePosition = vec2(.5, .5) * ratio;

        variables.init = 1;
    }

    if(params.mouseWheel == 1.){
        if(params.mouseDeltaY > 0){
            variables.circleRadius += .0001;
        }else{
            variables.circleRadius -= .0001;
        }
    }

    // resetEvent();
    // event[0] = 0;
    click[0] = 0;
    if(params.mouseClick == 1.){
        variables.circlePosition = mouse * ratio;

        click[0] = 32;
        click[1] = params.time;
        click[2] = 3;
    }

    let circleValue = sdfCircle(variables.circlePosition, variables.circleRadius, 0., uvr);
    var clickCircleColor = vec4(1) * circleValue;

    if(params.mouseDown == 1.){
        clickCircleColor *= GREEN;
    }else{
        clickCircleColor *= RED;
    }

    // < ------------ TWO PULSATING CIRCLES
    var circle1Radius = .01;
    var circle2Radius = .01;

    left_blink[0] = 0;
    if(params.time % 1 == 0){
        circle1Radius = .1;
        left_blink[0] = 1;
        left_blink[1] = 1;

    }
    right_blink[0] = 0;
    if(params.time % 2 == 0){
        circle2Radius = .1;
        right_blink[0] = 2;
        right_blink[1] = 2;
    }

    let circleValue1 = sdfCircle(vec2f(.2,.5), circle1Radius, 0., uvr);
    let circleValue2 = sdfCircle(vec2f(.8,.5), circle2Radius, 0., uvr);

    var circle1Color = circleValue1 * WHITE;
    var circle2Color = circleValue2 * WHITE;
    // > ------------ TWO PULSATING CIRCLES






    return clickCircleColor + circle1Color + circle2Color;
}
`;

export default frag;
