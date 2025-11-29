import { rotXAxis, rotYAxis, rotZAxis } from 'points/math';

const vert = /*wgsl*/`

${rotXAxis}
${rotYAxis}
${rotZAxis}

@vertex
fn main(in: VertexIn) -> FragmentIn {
    var angleZ = params.time * 0.9854;
    var angleY = params.time * 0.94222;
    var angleX = params.time * 0.865;

    if(id == mesh.cube1){
        angleZ = params.time * 0.1854;
        angleY = params.time * 0.694222;
        angleX = params.time * 0.4865;
    }

    let rotX = rotXAxis(angleX);
    let rotY = rotYAxis(angleY);
    let rotZ = rotZAxis(angleZ);
    let model = rotX * rotY * rotZ;

    let world = (model * vec4f(position.xyz, 1.)).xyz;
    let clip = params.projection * params.view * vec4f(world, 1.);

    let newNormal = normalize((model * vec4f(normal, 0.)).xyz);

    var dvb = defaultVertexBody(clip, color, uv, newNormal);
    dvb.id = id;

    return dvb;
}
`;

export default vert;
