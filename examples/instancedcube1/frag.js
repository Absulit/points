import { fnusin } from 'points/animation';
import { rotateVector } from 'points/math';
import { snoise } from 'points/noise2d';
import { texturePosition } from 'points/image';
import { brightness } from 'points/color';
import { sdfCircle } from 'points/sdf';
import { RED } from 'points/color';
const frag = /*wgsl*/`

${fnusin}
${snoise}
${texturePosition}
${brightness}
${rotateVector}
${sdfCircle}
${RED}

struct Variable{
    init:f32
}

const CENTER = vec2(.5,.5);
const UNIT = 1. / 100.;

fn rotateX(p:vec3<f32>, rads:f32 ) -> vec3<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let znew = p.z * c - p.y * s;
    let ynew = p.z * s + p.y * c;
    return vec3(p.x, ynew, znew);
}

fn rotateY(p:vec3<f32>, rads:f32 ) -> vec3<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.z * s;
    let znew = p.x * s + p.z * c;
    return vec3(xnew, p.y, znew);
}

fn rotateZ(p:vec3<f32>, rads:f32 ) -> vec3<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.y * s;
    let ynew = p.x * s + p.y * c;
    return vec3(xnew, ynew, p.z);
}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    if(variables.init == 0.){
        // let unit = 1. / 100.;
        var index = 0;

        let step = 1;
        let side = i32( params.side / 2 );
        let sideNegative = -1 * side;


        for (var x = sideNegative; x < side; x+=step) {
            let xF32 = f32(x);
            for (var y = sideNegative; y < side; y+=step) {
                let yF32 = f32(y);
                for (var z = sideNegative; z < side; z+=step) {
                    let zF32 = f32(z);

                    points[index] = vec3( xF32 * UNIT,  yF32 * UNIT,   (zF32 * UNIT)  );
                    index++;
                }
            }
        }

        variables.init = 1.;
    }

    var circles = 0.;
    for (var index = 0; index < i32(params.numPoints); index++) {
        let startPosition = points[index];
        // let startPosition = vec3<f32>(.024, .024, 1.);
        var pt = rotateZ(startPosition, params.time * .9854);
        pt = rotateY(pt, params.time * .94222);
        pt = rotateX(pt, params.time * .865);

        pt.z = pt.z + (400 * UNIT * .08);

        circles += sdfCircle(CENTER + pt.xy / pt.z / params.sliderA, .01, .0, uvr);
    }


    return vec4(uv, circles, 1) * circles;
}
`;

export default frag;
