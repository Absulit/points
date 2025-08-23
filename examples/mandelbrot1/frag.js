import { fusin } from 'points/animation';
import { layer, RED, GREEN, BLUE, YELLOW } from 'points/color';
import { showDebugCross } from 'points/debug';
import { polar } from 'points/math';
import { sdfCircle, sdfLine, sdfSegment } from 'points/sdf';
const frag = /*wgsl*/`

struct Variable{
    init: f32,
    zoom:f32,
    wheelMovements:f32,
    isClicked:u32,
    mouseStart:vec2f,
    mouseEnd:vec2f,
    fragtalCenter:vec2f,
    finalPosition:vec2f,
}

${fusin}
${showDebugCross}
${RED}
${GREEN}
${BLUE}
${YELLOW}
${sdfLine}
${sdfSegment}
${layer}
${sdfCircle}
${polar}

const NUMITERATIONS = 614;
const MAXWHEELMOVEMENTS = 162000;

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

    if(variables.init == 0){
        variables.fragtalCenter = center;
        variables.finalPosition = center;
        variables.init = 1;
        variables.zoom = .5;
        variables.wheelMovements = 1.;
    }

    // is mouse zooming in or out
    let direction = mix(-1, 1, step(0, params.mouseDelta.y));
    // Add or remove to zoom if wheel is actually being moved.
    // Increments and decreases exponentially to compensate speed.
    variables.zoom *= 1.0 + direction * params.mouseWheel * .0001;
    if(variables.zoom < 0.){
        variables.zoom = .01;
    }

    variables.wheelMovements += 1. * direction * params.mouseWheel;
    if(variables.wheelMovements < 0.){
        variables.wheelMovements = 1.;
    }

    if(params.mouseDown == 1 && variables.isClicked == 0){
        variables.mouseStart = mouse * ratio;
        variables.isClicked = 1;
    }

    let new_scale = variables.zoom;
    let numIterations = i32( 40 + NUMITERATIONS * (variables.wheelMovements / MAXWHEELMOVEMENTS)); // 192000
    // logger = variables.wheelMovements;

    // if we zoom in too much the distance on the drag is way bigger
    // so we have to scale it with new_scale
    let d = distance(variables.mouseStart, variables.mouseEnd) / new_scale;
    let a = angle(variables.mouseStart, variables.mouseEnd);
    let p = polar(d, a);

    if(params.mouseClick == 1){
        variables.isClicked = 0;
        variables.fragtalCenter = variables.finalPosition;
    }

    if(params.mouseDown == 1){
        variables.mouseEnd = mouse * ratio;
        variables.finalPosition = variables.fragtalCenter + p;
    }

    let fp = variables.finalPosition;

    let cross = showDebugCross(fp, RED, uvr);
    let cross_center = showDebugCross(center, YELLOW, uvr);

    let c = (uvr - center) / new_scale - fp + center;

    var x = 0.;
    var y = 0.;
    var iteration = 0;
    while(x * x + y * y <= 4 && iteration < numIterations){
        var x_new = x * x - y * y + c.x;
        y = 2 * x * y + c.y;
        x = x_new;
        iteration++;
    }

    let percentageIteration = f32(iteration) / f32(numIterations);


    var finalColor = vec4f();

    if(iteration < numIterations){
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

    // to draw a couple of circles to debug the touch
    // let startCircle = sdfCircle(variables.mouseStart, .01,.01, uvr) * GREEN;
    // let endCircle = sdfCircle(variables.mouseEnd, .01,.01, uvr) * BLUE;
    // return layer(layer(finalColor, startCircle), endCircle);

    return finalColor;
}
`;

export default frag;
