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
fn main(
    @location(0) position:vec4f,
    @location(1) color:vec4f,
    @location(2) uv:vec2f,
    @location(3) normal:vec3f,
    @location(4) id:u32,
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> Fragment {

    if(params.visibility == 0 && mesh.base_mesh == id){
        return Fragment();
    }

    var angleZ = params.time * 0.9854;
    var angleY = params.time * 0.94222;
    var angleX = params.time * 0.865;

    // if(id == mesh.base_mesh){
    //     angleZ = params.time * 0.1854;
    //     angleY = params.time * 0.694222;
    //     angleX = params.time * 0.4865;
    // }

    var p = vec4f();
    if(instanceIndex >= 0){
        p = vertex_data[instanceIndex];
    }

    let rotX = rotXAxis(0);
    let rotY = rotYAxis(angleY);
    let rotZ = rotZAxis(0);
    var model = rotX * rotY * rotZ;

    var rotated = model * (position);
    if(mesh.instance_mesh == id){
        model = rotX * rotY * rotZ * translationMatrix(p.xyz);
        rotated = model * position;
    }
    let scaled = rotated * 1;//scale;
    let world = scaled;

    let clip = params.projection * params.view * world;

    let newNormal = normalize((model * vec4f(normal, 0.)).xyz);

    var dvb = defaultVertexBody(clip, color, uv, newNormal);
    dvb.id = id;

    return dvb;
}
`;

export default vert;
