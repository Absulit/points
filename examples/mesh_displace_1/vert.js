import { rotXAxis, rotYAxis, rotZAxis } from 'points/math';
import { pnoise3 } from 'points/classicnoise3d';

const vert = /*wgsl*/`

${rotXAxis}
${rotYAxis}
${rotZAxis}
${pnoise3}

fn turbulence(p:vec3f) -> f32 {
    let w = 100.0;
    var t = -.5;

    for (var f:f32 = 1; f <= 10; f+=1.){
        let power = pow( 2.0, f );
        t += abs(pnoise3(vec3(power * p), vec3(10., 10., 10.)) / power);
    }

    return t;
}

@vertex
fn main(in: VertexIn) -> FragmentIn {
    var angleZ = params.time * 0.9854;
    var angleY = params.time * 0.94222;
    var angleX = params.time * 0.865;

    let rotX = rotXAxis(angleX);
    let rotY = rotYAxis(angleY);
    let rotZ = rotZAxis(angleZ);
    let model = rotX * rotY * rotZ;

    let noise = 10.0 * -.10 * turbulence(.5 * in.normal + params.time / 3.0);
    let b = 5.0 * pnoise3(0.05 * in.position.xyz, vec3(100.));
    let displacement = (-10. * noise + b) / 50.0;

    let displace = in.normal * displacement * params.val * 4;
    let world = (model * vec4f(in.position.xyz + displace, 1.)).xyz;
    let clip = params.projection * params.view * vec4f(world, 1.);

    let newNormal = normalize((model * vec4f(in.normal, 0.)).xyz);

    var dvb = defaultVertexBody(clip, vec4f(vec3f(noise), 1), in.uv, newNormal);
    // dvb.id = in.id;

    return dvb;
}
`;

export default vert;
