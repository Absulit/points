import { fnusin, polar, rotateVector, sdfCircle, sdfLine, sdfLine2, sdfSegment, sdfSquare } from '../../src/core/defaultFunctions.js';

const frag = /*wgsl*/`

${fnusin}
${sdfSegment}
${sdfLine}
${polar}
${sdfCircle}
${rotateVector}
${sdfSquare}
${sdfLine2}

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let point = points[0];

    var orangeBall = sdfCircle(vec2(.4,.5), .1,0, uv) * vec4(1,.5,0,1);
    var redBall = sdfCircle(vec2(.6,.5),  .1,.1,  uv) * vec4(1,0,0,1);

    var finalColor:vec4<f32> = mix(orangeBall, redBall, uv.x);

    //finalColor += sdfSquare(uv, vec2(.9, .5  ),  10);
    //finalColor += sdfLine(vec2(.5,.5), vec2(.6,.6), .001, uv );
    finalColor += sdfLine2( vec2(.5,.5), vec2(.6,.6), .001, uv / ratio);


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
        finalColor += sdfLine2( pointPosition, pointPosition2, .001 + .1 * params.sliderC, uv / ratio );
        //finalColor += sdfLine(pointPosition, pointPosition2, .001 + 10 * params.sliderC, uv  );
    }

    return finalColor;
}
`;

export default frag;
