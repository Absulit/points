import { fnusin, fucos, fusin } from 'points/animation';
const frag = /*wgsl*/`

${fnusin}
${fusin}
${fucos}


const NUMITERATIONS = 40;

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let center = vec2(.5,.5) * ratio;

    let c_re = (uvr.x - center.x) / params.scale;
    let c_im = (uvr.y - center.y) / params.scale;

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


    var finalColor:vec4f = vec4();

    if(iteration < NUMITERATIONS){
        finalColor = vec4(percentageIteration, percentageIteration * uvr.x * fusin(1), percentageIteration * uvr.y, 1);
    }else{
        finalColor = vec4(percentageIteration, percentageIteration * uvr.x, 1 - percentageIteration * uvr.y, 1);
    }

    return finalColor;
}
`;

export default frag;
