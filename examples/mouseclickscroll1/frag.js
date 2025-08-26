import { sdfCircle } from 'points/sdf';
import { GREEN, RED } from 'points/color';

const frag = /*wgsl*/`

struct Variable{
    init: f32,
    circleRadius:f32,
    circlePosition:vec2f
}

${sdfCircle}
${RED + GREEN}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
        @location(3) uvr: vec2f,    // uv with aspect ratio corrected
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    if(variables.init == 0.){
        variables.circleRadius = .1;
        variables.circlePosition = vec2(.5, .5) * ratio;

        variables.init = 1.;
    }

    if(params.mouseWheel == 1.){
        if(params.mouseDelta.y > 0.){
            variables.circleRadius += .0001;
        }else{
            variables.circleRadius -= .0001;
        }
    }

    if(params.mouseClick == 1.){
        variables.circlePosition = mouse * ratio;
    }

    let circleValue = sdfCircle(
        variables.circlePosition,
        variables.circleRadius,
        0.,
        uvr
    );

    var finalColor = vec4(circleValue);

    if(params.mouseDown == 1.){
        finalColor *= GREEN;
    }else{
        finalColor *= RED;
    }

    return finalColor;
}
`;

export default frag;
