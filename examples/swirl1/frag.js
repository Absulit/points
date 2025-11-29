import { PI, rotateVector } from 'points/math';
import { snoise } from 'points/noise2d';
import { structs } from './structs.js';

const frag = /*wgsl*/`

${rotateVector}
${PI}
${snoise}
${structs}

fn paletteLerp(a:array<vec3f,6>, value:f32) -> vec3f {
    let numElements = 6.;
    let elementPercent = 1 / numElements;
    let index = value / elementPercent;
    let minIndex = i32(floor(index));
    let maxIndex = i32(ceil(index));

    let a0 = a[minIndex];
    let a1 = a[maxIndex];

    return mix(a0, a1, fract(index));
}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {


    if(variables.init == 0){
        var index = 0;
        // TODO: initialize with StorageMap from JS
        colors[index] = vec3f(248, 208, 146) / 255; index++;
        colors[index] = vec3f(21, 144, 151) / 255; index++;
        colors[index] = vec3f(56, 164, 140) / 255; index++;
        colors[index] = vec3f(26, 86, 120) / 255; index++;
        colors[index] = vec3f(37, 36, 93) / 255; index++;
        colors[index] = vec3f(87, 28, 86) / 255; index++;

        variables.init = 1;
    }

    let center = vec2f(.5) * ratio;

    let d = 1 - distance(uvr, center);
    let uvrRotated = rotateVector(
        (uvr - center) / params.scale,
        params.time * .1
    );
    let uvrTwisted = rotateVector(
        uvrRotated,
        params.rotation * 2 * PI * d
    );

    //if(params.displace == 1){displaceValue = params.time;}
    let displaceValue = params.time * params.displace;

    let n = snoise(displaceValue + uvrTwisted ) * .5 + .5;

    let finalColor = vec4(
        paletteLerp(colors, fract(n + params.time * .01 + in.uvr.x)),
        1
    );

    return finalColor;
}
`;

export default frag;
