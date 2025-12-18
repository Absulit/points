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

    let rotX = rotXAxis(0);
    let rotY = rotYAxis(0);
    let rotZ = rotZAxis(0);
    let model = rotX * rotY * rotZ;

    let world = (model * vec4f(in.position.xyz, 1.)).xyz;
    let clip = camera.camera0_projection * camera.camera0_view * vec4f(world, 1.);

    let newNormal = normalize((model * vec4f(in.normal, 0.)).xyz);

    var dvb = defaultVertexBody(clip, in.color, in.uv, newNormal);
    dvb.world = world;

    return dvb;
}
`;

export default vert;
