import { rotXAxis, rotYAxis, rotZAxis } from "points/math";

const vert = /*wgsl*/`
${rotXAxis}
${rotYAxis}
${rotZAxis}

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

    let scale = mat4x4f(
        vec4f(params.scale.x, 0.0, 0.0, 0.0),
        vec4f(0.0, params.scale.y, 0.0, 0.0),
        vec4f(0.0, 0.0, params.scale.z, 0.0),
        vec4f(0.0, 0.0, 0.0, 1.0)
    );

    let rotX = rotXAxis(0);
    let rotY = rotYAxis(0);
    let rotZ = rotZAxis(0);
    let model = rotX * rotY * rotZ * scale;

    let world = (model * vec4f(in.position.xyz, 1.)).xyz;
    let clip = camera.camera_projection * camera.camera_view * vec4f(world, 1.);

    let newNormal = normalize((model * vec4f(in.normal, 0.)).xyz);

    var dvb = defaultVertexBody(clip, in.color, in.uv, newNormal);
    dvb.world = world;

    return dvb;
}
`;

export default vert;
