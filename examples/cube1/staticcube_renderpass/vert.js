import { rotXAxis, rotYAxis, rotZAxis } from "points/math";

const vert = /*wgsl*/`

${rotXAxis}
${rotYAxis}
${rotZAxis}

@vertex
fn main(in: VertexIn) -> FragmentIn {

    let rotX = rotXAxis(params.time * -.6854);
    let rotY = rotYAxis(params.time * .4222);
    let rotZ = rotZAxis(params.time * .3865);

    let model = rotX * rotY * rotZ;

    let world = (model * vec4f(in.position.xyz, 1.)).xyz * 2;
    let clip = camera.camera_projection * camera.camera_view * vec4f(world, 1.0);

    return defaultVertexBody(clip, in.color, in.uv, in.normal);
}
`;

export default vert;
