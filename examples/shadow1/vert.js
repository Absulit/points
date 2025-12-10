import { rotXAxis, rotYAxis, rotZAxis, TAU } from "points/math";

const vert = /*wgsl*/`

${rotXAxis}
${rotYAxis}
${rotZAxis}
${TAU}


fn translateMatrix(pos:vec3f) -> mat4x4f {
    return mat4x4f(
        vec4f(1.0, 0.0, 0.0, 0.0),
        vec4f(0.0, 1.0, 0.0, 0.0),
        vec4f(0.0, 0.0, 1.0, 0.0),
        vec4f(pos.x, pos.y, pos.z, 1.0)
    );
}

/**
 * VertexIn
 * position: vec4f,
 * color: vec4f,
 * uv: vec2f,
 * normal: vec3f,
 * id: u32,       // mesh id
 * vertexIndex: u32,
 * instanceIndex: u32,
 */
@vertex
fn main(in: VertexIn) -> FragmentIn {

    var rotX = rotXAxis(0);
    var rotY = rotYAxis(0);
    var rotZ = rotZAxis(0);

    if(mesh.plane == in.id){
        rotX = rotXAxis(TAU * params.val);
    }

    let model = rotX * rotY * rotZ;

    let world = model * in.position;
    let clip = camera.camera_projection * camera.camera_view * world;



    return defaultVertexBody(clip, in.color, in.uv, in.normal);
}
`;

export default vert;
