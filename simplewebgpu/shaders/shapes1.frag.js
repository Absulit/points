import defaultStructs from './defaultStructs.js';
import { fnusin, polar, sdfLine, sdfSegment } from './defaultFunctions.js';

const shapes1Frag = /*wgsl*/`

${defaultStructs}

${fnusin}
${sdfSegment}
${sdfLine}
${polar}


fn sdfCircle(position:vec2<f32>, radius: f32, stroke: f32, uv:vec2<f32>) -> vec4<f32> {
    let d = distance(uv, position);
    let st = 1 - smoothstep(radius, radius + stroke, d);
    return vec4(st);
}

fn rotateVector(p:vec2<f32>, rads:f32 ) -> vec2<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.y * s;
    let ynew = p.x * s + p.y * c;
    return vec2(xnew, ynew);
}

fn sdfSquare(position:vec2<f32>, radius:f32, stroke:f32, rotationRads: f32, uv:vec2<f32>) -> vec4<f32> {
    let positionRotated = rotateVector(position, rotationRads);
    let uvRotated = rotateVector(uv, rotationRads);

    var d = distance(uvRotated.x,  positionRotated.x );
    var s = smoothstep(radius, radius + stroke,  d);

    d = distance(uvRotated.y,  positionRotated.y);
    s += smoothstep(radius, radius + stroke,  d);
    s = clamp(0,1, s);
    return vec4(1-s);
}


fn sdfLine2(p1:vec2<f32>, p2:vec2<f32>, stroke:f32, uv:vec2<f32>)->f32{
    let d = sdfSegment(uv, p1, p2);
    var s = smoothstep(0, stroke,  d);
    return 1-s;
}


@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: f32,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let point = points[0];

    var orangeBall = sdfCircle(vec2(.4,.5), .1,0, uv) * vec4(1,.5,0,1);
    var redBall = sdfCircle(vec2(.6,.5),  .1,.1,  uv) * vec4(1,0,0,1);

    var finalColor:vec4<f32> = mix(orangeBall, redBall, uv.x);

    //finalColor += sdfSquare(uv, vec2(.9, .5  ),  10);
    //finalColor += sdfLine(uv, vec2(.0,.0), vec2(.6,.6), 1 );
    finalColor += sdfLine2( vec2(.5,.5), vec2(.6,.6), .001, uv );


    for(var i:u32; i<10;i++){
        let fi = f32(i);
        let p = vec2(fnusin(1.1 + .1 * fi)+.5, fnusin(.98 + .1 * fi)+.5);
        finalColor += sdfSquare(p, params.sliderA, params.sliderB, radians(360) * fnusin(2),uv) * vec4(uv.x,1-uv.y,0,  fi/10);
    }

    //----
    // displaying the sine wave
    let numPoints = u32(params.numPoints);
    for(var k:u32; k < numPoints; k++){
        let fk = f32(k);
        let point = points[k];
        let point2 = points[k+1];

        let pointPosition = vec2(point.x, point.y + .5);
        let pointPosition2 = vec2(point2.x, point2.y + .5);

        //finalColor += sdfSquare(pointPosition, .001 * 4, 0, 0, uv) * vec4(1,1,0,  1);
        finalColor += sdfLine2( pointPosition, pointPosition2, .001 + .1 * params.sliderC, uv );
    }

    return finalColor;
}
`;

export default shapes1Frag;
