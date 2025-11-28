import { rotXAxis, rotYAxis, rotZAxis } from "points/math";

const vert = /*wgsl*/`

${rotXAxis}
${rotYAxis}
${rotZAxis}

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @location(4) id: u32,
    @location(5) barycentrics: vec3f,
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> Fragment {

    let rotX = rotXAxis(params.time * -.6854);
    let rotY = rotYAxis(params.time * .4222);
    let rotZ = rotZAxis(params.time * .3865);

    let model = rotX * rotY * rotZ;

    let world = (model * vec4f(position.xyz, 1.)).xyz * 2;
    let clip = params.projection * params.view * vec4f(world, 1.0);

    var dvb = defaultVertexBody(clip, color, uv, normal);
    dvb.barycentrics = barycentrics;
    return dvb;
}
`;

export default vert;
