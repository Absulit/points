import { fnusin } from 'points/animation';
import { RED } from 'points/color';
import { rotateVector } from 'points/math';
import { sdfLine2, sdfCircle, sdfSquare, sdfSegment } from 'points/sdf';


const frag = /*wgsl*/`

${fnusin}
${sdfSegment}
${sdfCircle}
${rotateVector}
${sdfSquare}
${sdfLine2}
${RED}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let point = points[0];

    let orangeBall = sdfCircle(vec2(.4, .5) * ratio, .1, 0., uvr) *
        vec4(1, .5, 0, 1);
    let redBall = sdfCircle(vec2(.6, .5) * ratio, .1, .1, uvr) * RED;

    var finalColor = mix(orangeBall, redBall, uvr.x);

    finalColor += sdfLine2( vec2(.5) * ratio, vec2(.6), .001, uvr / ratio);


    for(var i:u32; i<10;i++){
        let fi = f32(i);
        let p = vec2(fnusin(1.1 + .1 * fi) + .5, fnusin(.98 + .1 * fi) + .5);
        finalColor += sdfSquare(
            p,
            params.squareSize,
            params.squareFeather,
            radians(360.) * fnusin(2.),
            uvr
        ) * vec4(uvr.x, 1 - uvr.y, 0, fi / 10);
    }

    //----
    // displaying the sine wave
    let numPoints = u32(params.numPoints);
    for(var k:u32; k < numPoints; k++){
        let fk = f32(k);
        let point = points[k];
        let point2 = points[k + 1];

        let pointPosition = vec2(point.x, point.y + .5);
        let pointPosition2 = vec2(point2.x, point2.y + .5);

        finalColor += sdfLine2(
            pointPosition,
            pointPosition2,
            .001 + .1 * params.lineWidth,
            uvr / ratio
        );
    }

    return finalColor;
}
`;

export default frag;
