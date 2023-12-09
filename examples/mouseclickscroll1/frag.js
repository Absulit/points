import { sdfCircle } from '../../src/core/sdf.js';
import { GREEN, RED } from './../../src/core/color.js';

const frag = /*wgsl*/`

struct Variable{
    init: f32,
    circleRadius:f32,
    circlePosition:vec2<f32>
}

${sdfCircle}
${RED + GREEN}

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
        @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    if(variables.init == 0.){
        variables.circleRadius = .1;
        variables.circlePosition = vec2(.5, .5) * ratio;

        variables.init = 1.;
    }

    if(params.mouseWheel == 1.){
        if(params.mouseDeltaY > 0.){
            variables.circleRadius += .0001;
        }else{
            variables.circleRadius -= .0001;
        }
    }

    if(params.mouseClick == 1.){
        variables.circlePosition = mouse * ratio;
    }

    let circleValue = sdfCircle(variables.circlePosition, variables.circleRadius, 0., uvr);
    var finalColor = vec4(1.) * circleValue;

    if(params.mouseDown == 1.){
        finalColor *= GREEN;
    }else{
        finalColor *= RED;
    }

    return finalColor;
}
`;

export default frag;
