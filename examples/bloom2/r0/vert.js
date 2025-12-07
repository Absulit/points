import { rotXAxis, rotYAxis, rotZAxis } from 'points/math';

const vert = /*wgsl*/`

${rotXAxis}
${rotYAxis}
${rotZAxis}

@vertex
fn main(in: VertexIn) -> FragmentIn {

    var angleZ = params.time * 0.9854;
    var angleY = params.time * 0.94222;
    var angleX = params.time * -0.865;

    if(in.id == mesh.cube0){
        angleZ = params.time * 0.1854;
        angleY = params.time * -0.694222;
        angleX = params.time * 0.4865;
    }
    if(in.id == mesh.cube1){
        angleZ = params.time * -0.2854;
        angleY = params.time * 0.594222;
        angleX = params.time * 0.1865;
    }

    let rotX = rotXAxis(angleX);
    let rotY = rotYAxis(angleY);
    let rotZ = rotZAxis(angleZ);
    let model = rotX * rotY * rotZ;

    var offset = vec4f(0,0,0,1);
    if(in.id == mesh.cube0){
        offset = vec4f(-1,0,0,1);
    }
    if(in.id == mesh.cube1){
        offset = vec4f(1,0,0,1);
    }

    let world = (offset + model * vec4f(in.position.xyz, 1.)).xyz;
    let clip = camera.camera_projection * camera.camera_view * vec4f(world, 1.);

    let newNormal = normalize((model * vec4f(in.normal, 0.)).xyz);

    var dvb = defaultVertexBody(clip, in.color, in.uv, newNormal);
    dvb.barycentrics = in.barycentrics;
    dvb.id = in.id;

    return dvb;
}
`;

export default vert;
