import { rotXAxis, rotYAxis, rotZAxis } from "points/math";

const vert = /*wgsl*/`

${rotXAxis}
${rotYAxis}
${rotZAxis}

@vertex
fn main(in:VertexIn) -> FragmentIn {
    var angleZ = params.time * 0.9854;
    var angleY = params.time * 0.94222;
    var angleX = params.time * -0.865;

    var offset = vec4f(0,0,0,1);
    var scale = 1.;

    if(in.id == mesh.cube0){
        angleZ = params.time * 0.1854;
        angleY = params.time * -0.694222;
        angleX = params.time * 0.4865;

        offset = vec4f(-1,0,0,1);
    }
    if(in.id == mesh.cylinder0){
        angleZ = params.time * -0.2854;
        angleY = params.time * 0.594222;
        angleX = params.time * 0.1865;

        offset = vec4f(1,0,0,1);
    }
    if(in.id == mesh.sphere0){
        angleZ = params.time * 0.6894;
        angleY = params.time * 0.44994;
        angleX = params.time * 0.58657;

        offset = vec4f(0,1.6,0,1);
        scale = .5;
    }
    if(in.id == mesh.torus0){
        offset = vec4f(0,-1.6,0,1);
        scale = .5;
    }
    if(in.id == mesh.plane0){
        offset = vec4f(0,0,-2,1);
        scale = 8.;
    }
    if(in.id == mesh.monkey){
        angleZ = params.time * 0.0;
        angleY = params.time * 0.44994;
        angleX = params.time * 0.0;

        // offset = vec4f(0,-1,0,1);
        scale = .5;
    }


    let rotX = rotXAxis(angleX);
    let rotY = rotYAxis(angleY);
    let rotZ = rotZAxis(angleZ);
    let model = rotX * rotY * rotZ;



    let world = (offset + model * vec4f(in.position.xyz, 1.)).xyz * scale;
    let clip = camera.camera_projection * camera.camera_view * vec4f(world, 1.);

    let newNormal = normalize((model * vec4f(in.normal, 0.)).xyz);

    var dvb = defaultVertexBody(clip, in.color, in.uv, newNormal);
    dvb.barycentrics = in.barycentrics;
    dvb.id = in.id;

    return dvb;
}
`;

export default vert;
