/**
 * based on this demo by The Art of Code
 * https://www.shadertoy.com/view/ts2XDw
 */

import defaultStructs from '../defaultStructs.js';
import { fnusin } from '../defaultFunctions.js';

const frag = /*wgsl*/`

${defaultStructs}

${fnusin}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let uv2 = uv * mat2x2f(cos(params.utime), -sin(params.utime), sin(params.utime), cos(params.utime));

    let ro = vec3(0., 0., -1.);
    let lookat =  mix(vec3(-1, 0, -1),  vec3(0.), sin(params.utime*1.56)*.5+.5 );
    let zoom = mix(.2, .7, sin(params.utime)*.5+.5);

    let f = normalize(lookat - ro);
    let r = normalize(cross(vec3(0., 1., 0.), f));
    let u = cross(f, r);

    let c = ro + f * zoom; // center
    let i = c + uv2.x * r + uv2.y * u;
    let rd = normalize(i - ro); // ray direction

    let radius = mix(.3, 1.5, sin(params.utime*.4) * .5+.5);
    var dS = 0.; // distance to surface
    var dO = 0.; // distance to origin
    var p = vec3(0.);

    for(var i=0; i<100; i++){
        p = ro + rd * dO;
        dS = -(length(vec2(length(p.xz) - 1., p.y)) - radius);
        if(dS < .001){break;}
        dO += dS;
    }

    var col = vec3(0.);
    if(dS < .001){
        let x = atan2(p.x, p.z) + params.utime * .1;
        let y = atan2(length(p.xz) - 1, p.y);

        let bands = sin(y*10 + x * 20);
        let ripples = sin( (x*10 - y * 30) * 3 ) * .5 + .5;
        let waves = sin(x-y*6 + params.utime);

        let b1 = smoothstep(-.2, .2, bands);
        let b2 = smoothstep(-.2, .2, bands-.5);

        var m = b1 * (1-b2);
        m = max(m, ripples * b2 * max(0, waves));
        m += max(0, waves * .3 * b2);
        col += mix(m, 1-m, smoothstep(-.3, .3, sin(x+params.utime)));
    }



    return vec4(col,1);
}
`;

export default frag;
