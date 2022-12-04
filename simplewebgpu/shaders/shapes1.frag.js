import defaultStructs from './defaultStructs.js';
import { fnusin, sdfLine, sdfSegment } from './defaultFunctions.js';

const shapes1Frag = /*wgsl*/`

${defaultStructs}

${fnusin}
${sdfSegment}
${sdfLine}


fn sdfCircle(position:vec2<f32>, radius: f32, uv:vec2<f32>) -> vec4<f32>{
    let d = distance(uv, position);
    var c = 1.;
    if(d > radius){
        c = 0;
    }
    return vec4(c);
}

fn sdfCircleSmooth(position:vec2<f32>, minRadius: f32, maxRadius: f32, uv:vec2<f32>) -> vec4<f32> {
    let d = distance(uv, position);
    let st = 1 - smoothstep(minRadius, maxRadius, d);
    return vec4(st);
}

// float sdBox( in vec2 p, in vec2 b )
// {
//     vec2 d = abs(p)-b;
//     return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
// }

fn sdfBox(p:vec2<f32>,b:vec2<f32>) -> f32 {
    let d = abs(p)-b;
    return length(max(d, vec2(0.,0.))) + min(max(d.x,d.y), 0.0);
}

fn sdfSquare(uv:vec2<f32>, p2:vec2<f32>, pixelStroke:f32) -> f32 {
    let d = sdfBox(uv, p2);
    var value = 1.0;
    if(d > pixelStroke/800.){
        value = 0.;
    }
    return value;
}



@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: f32,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let d = distance(uv, vec2(.5, .5));
    let st = smoothstep(params.sliderA, params.sliderB , d);
    var c = 1.;
    if(d > .1){
        c = 0;
    }


    var orangeBall = sdfCircle(vec2(.4,.5), .1, uv) * vec4(1,.5,0,1);
    var redBall = sdfCircleSmooth(vec2(.6,.5),  .1,.2,  uv) * vec4(1,0,0,1);

    var finalColor:vec4<f32> = sdfCircle(vec2(.4,.5), .1, uv) * vec4(1,.5,0,1);
    finalColor = mix(orangeBall, redBall, .5);

    finalColor += sdfSquare(uv, vec2(.5,.5),  10);
    //finalColor += sdfBox(vec2(.0,.0), vec2(.1,.1));
    finalColor += sdfLine(uv, vec2(.0,.0), vec2(.1,.1), 1 );

    return finalColor;
}
`;

export default shapes1Frag;
