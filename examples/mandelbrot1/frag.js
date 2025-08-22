import { fusin } from 'points/animation';
import { layer, RED } from 'points/color';
import { showDebugCross } from 'points/debug';
import { sdfLine, sdfSegment } from 'points/sdf';
const frag = /*wgsl*/`

struct Variable{
    init: f32,
    zoom:f32,
    circlePosition:vec2f
}

${fusin}
${showDebugCross}
${RED}
${sdfLine}
${sdfSegment}
${layer}

const NUMITERATIONS = 40;

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {


    // is mouse zooming in or out
    let direction = mix(-1, 1, step(0, params.mouseDelta.y));
    // add or remove to zoom if wheel is actually being moved
    variables.zoom += .0001 * direction * params.mouseWheel;


    if(params.mouseDown == 1){

    }
    if(params.mouseClick == 1){

    }

    let new_scale = params.scale / variables.zoom;

    let center = vec2(.5,.5) * ratio;
    let cross = showDebugCross(center, RED, uvr);
    // let center = mouse * ratio;

    let c_re = (uvr.x - center.x) / new_scale;
    let c_im = (uvr.y - center.y) / new_scale;

    var x = 0.;
    var y = 0.;
    var iteration = 0;
    while(x * x + y * y <= 4 && iteration < NUMITERATIONS){
        var x_new = x * x - y * y + c_re;
        y = 2 * x * y + c_im;
        x = x_new;
        iteration++;
    }

    let percentageIteration = f32(iteration) / NUMITERATIONS;


    var finalColor = vec4f();

    if(iteration < NUMITERATIONS){
        finalColor = vec4(
            percentageIteration,
            percentageIteration * uvr.x * fusin(1),
            percentageIteration * uvr.y,
            1
        );
    }else{
        finalColor = vec4(
            percentageIteration,
            percentageIteration * uvr.x,
            1 - percentageIteration * uvr.y,
            1
        );
    }

    return layer(finalColor, cross);
}
`;

export default frag;
