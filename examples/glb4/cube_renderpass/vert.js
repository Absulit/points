import { rotXAxis, rotYAxis, rotZAxis, TAU } from 'points/math';

const vert = /*wgsl*/`

${rotXAxis}
${rotYAxis}
${rotZAxis}
${TAU}

const SCALE = .01;

@vertex
fn main(in: VertexIn) -> FragmentIn {
    // var angleZ = params.time * 0.9854;
    var angleY = params.time * 0.94222;
    // var angleX = params.time * 0.865;


    let rotX = rotXAxis(-TAU * .25);
    let rotY = rotYAxis(TAU * .5);
    let rotZ = rotZAxis(0);
    let model = rotX * rotY * rotZ;

    let world = (model * vec4f(in.position.xyz, 1.)).xyz * SCALE;
    let clip = camera.camera_projection * camera.camera_view * vec4f(world, 1.);

    let newNormal = normalize((model * vec4f(in.normal, 0.)).xyz);

    var dvb = defaultVertexBody(clip, in.color, in.uv, newNormal);
    dvb.id = in.id;

    return dvb;
}
`;

export default vert;
