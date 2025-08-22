import { fusin } from 'points/animation';
import { layer, RED, GREEN, BLUE } from 'points/color';
import { showDebugCross } from 'points/debug';
import { sdfCircle, sdfLine, sdfSegment } from 'points/sdf';
const frag = /*wgsl*/`

struct Variable{
    init: f32,
    zoom:f32,
    isClicked:u32,
    mouseStart:vec2f,
    mouseEnd:vec2f
}

${fusin}
${showDebugCross}
${RED}
${GREEN}
${BLUE}
${sdfLine}
${sdfSegment}
${layer}
${sdfCircle}

const NUMITERATIONS = 40;

//
fn angle(p1:vec2f, p2:vec2f) -> f32 {
    let delta = p2 - p1;
    let distance = length(delta);
    return atan2(delta.y, delta.x);
}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {
    let center = vec2(.5,.5) * ratio;

    // is mouse zooming in or out
    let direction = mix(-1, 1, step(0, params.mouseDelta.y));
    // add or remove to zoom if wheel is actually being moved
    variables.zoom += .0001 * direction * params.mouseWheel;


    if(params.mouseDown == 1 && variables.isClicked == 0){
        variables.mouseStart = mouse * ratio;
        variables.isClicked = 1;
    }
    if(params.mouseDown == 1){
        variables.mouseEnd = mouse * ratio;
    }

    if(params.mouseClick == 1){
        variables.isClicked = 0;
    }

    let new_scale = params.scale / variables.zoom;

    let fragtalCenter = center;

    let cross = showDebugCross(fragtalCenter, RED, uvr);

    let c_re = (uvr.x - fragtalCenter.x) / new_scale;
    let c_im = (uvr.y - fragtalCenter.y) / new_scale;

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

    let startCircle = sdfCircle(variables.mouseStart, .01,.01, uvr) * GREEN;
    let endCircle = sdfCircle(variables.mouseEnd, .01,.01, uvr) * BLUE;

    return layer(layer(layer(finalColor, cross), startCircle), endCircle);
}
`;

export default frag;
