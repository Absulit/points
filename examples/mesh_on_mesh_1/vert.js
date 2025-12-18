import { rotXAxis, rotYAxis, rotZAxis } from 'points/math';
import { structs } from './structs.js';

const vert = /*wgsl*/`
${structs}
${rotXAxis}
${rotYAxis}
${rotZAxis}

fn translationMatrix(offset: vec3f) -> mat4x4f {
    return mat4x4f(
        vec4f(1.0, 0.0, 0.0, 0.0),
        vec4f(0.0, 1.0, 0.0, 0.0),
        vec4f(0.0, 0.0, 1.0, 0.0),
        vec4f(offset.x, offset.y, offset.z, 1.0)
    );
}

@vertex
fn main(in: VertexIn) -> FragmentIn {

    if(params.visibility == 0 && mesh.base_mesh == in.id){
        return FragmentIn();
    }

    // let angleZ = params.time * 0.9854;
    let angleY = params.time * 0.94222;
    // let angleX = params.time * 0.865;

    let p = vertex_data[in.instanceIndex];

    let rotX = rotXAxis(0);
    let rotY = rotYAxis(angleY);
    let rotZ = rotZAxis(0);
    var model = rotX * rotY * rotZ;

    var rotated = model * in.position;
    if(mesh.instance_mesh == in.id){
        model = rotX * rotY * rotZ * translationMatrix(p.xyz);
        rotated = model * in.position;
    }

    let world = rotated;
    let clip = camera.camera_projection * camera.camera_view * world;

    let newNormal = normalize((model * vec4f(in.normal, 0.)).xyz);

    var dvb = defaultVertexBody(clip, in.color, in.uv, newNormal);
    dvb.id = in.id;

    return dvb;
}
`;

export default vert;
