import { fnusin, polar, rotateVector, sdfCircle, sdfLine, sdfLine2, sdfSegment, sdfSquare } from '../../src/core/defaultFunctions.js';
import { snoise } from '../../src/core/noise2d.js';

const frag = /*wgsl*/`

${fnusin}
${sdfSegment}
${sdfLine}
${polar}
${sdfCircle}
${rotateVector}
${sdfSquare}
${sdfLine2}
${snoise}

// this looks like a sunset

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let time = params.time;
    // let point = points[0];

    var circle = sdfCircle(vec2(.5,.5) * ratio, .2, .1, uvr);

    var n1 = (snoise(uvr * 5.14 + 200 * fract(time * -.01))+1)*.5;
    //var n2 = (snoise(uvr * 15.14 + 200 * fract(time * -.01))+1)*.5;
    let skewMask = vec2(1, 1.1);
    var mask = (1-sdfCircle(vec2(.5,.5) * ratio, .0999, .5, uvr * skewMask ));
    let result = vec4(1) * mask * n1 * circle + circle;



    var finalColor:vec4<f32> = mask * vec4(1,.5,0,1) + mix(  vec4(1,0,0,result.a),  vec4(1,.5,0,1), result );



    return finalColor;
}
`;

export default frag;
