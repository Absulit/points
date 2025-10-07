import { rotXAxis, rotYAxis, rotZAxis } from 'points/math';

const vert = /*wgsl*/`

${rotXAxis}
${rotYAxis}
${rotZAxis}

@vertex
fn main(
    @location(0) position:vec4f,
    @location(1) color:vec4f,
    @location(2) uv:vec2f,
    @location(3) normal:vec3f,
    @location(4) id:f32,
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> Fragment {
    let angleZ = params.time * 0.9854;
    let angleY = params.time * 0.94222;
    let angleX = params.time * 0.865;

    let rotX = rotXAxis(angleX);
    let rotY = rotYAxis(angleY);
    let rotZ = rotZAxis(angleZ);

    var model = rotX * rotY * rotZ;
    if(id == 1){
        model = rotX * rotY;
    }

    let world = (model * vec4f(position.xyz, 1.)).xyz;
    let clip = params.projection * params.view * vec4f(world, 1.);

    let newNormal = normalize((model * vec4f(normal, 0.)).xyz);

    return defaultVertexBody(clip, color, uv, newNormal);
}
`;

export default vert;
