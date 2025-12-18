import { rotXAxis, rotYAxis, rotZAxis } from 'points/math';
import { structs } from '../structs.js';

const vert = /*wgsl*/`

${structs}
${rotXAxis}
${rotYAxis}
${rotZAxis}

@vertex
fn main(in: VertexIn) -> FragmentIn {
    let particle = particles[in.instanceIndex];
    // var angleZ = params.time * 0.9854;
    var angleY = params.time * 0.094222;
    // var angleX = params.time * 0.865;

    let rotX = rotXAxis(0);
    let rotY = rotYAxis(angleY);
    let rotZ = rotZAxis(0);
    let model = rotX * rotY * rotZ;

    let offset = vec3f(0,1,-10);

    let world = (model * vec4f(particle.position.xyz + in.position.xyz - offset, 1.)).xyz;
    let clip = camera.camera_projection * camera.camera_view * vec4f(world, 1.);

    let newNormal = normalize((model * vec4f(in.normal, 0.)).xyz);

    var dvb = defaultVertexBody(clip, in.color, in.uv, newNormal);
    dvb.id = in.id;

    return dvb;
}
`;

export default vert;
