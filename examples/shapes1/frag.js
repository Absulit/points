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
fn main(in: FragmentIn) -> @location(0) vec4f {

    let point = points[0];

    let orangeBall = sdfCircle(vec2(.4, .5) * in.ratio, .1, 0., in.uvr) *
        vec4(1, .5, 0, 1);
    let redBall = sdfCircle(vec2(.6, .5) * in.ratio, .1, .1, in.uvr) * RED;

    var finalColor = mix(orangeBall, redBall, in.uvr.x);

    finalColor += sdfLine2( vec2(.5) * in.ratio, vec2(.6), .001, in.uvr / in.ratio);


    for(var i:u32; i<10;i++){
        let fi = f32(i);
        let p = vec2(fnusin(1.1 + .1 * fi) + .5, fnusin(.98 + .1 * fi) + .5);
        finalColor += sdfSquare(
            p,
            params.squareSize,
            params.squareFeather,
            radians(360.) * fnusin(2.),
            in.uvr
        ) * vec4(in.uvr.x, 1 - in.uvr.y, 0, fi / 10);
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
            in.uvr / in.ratio
        );
    }

    return finalColor;
}
`;

export default frag;
