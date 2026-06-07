import { rotXAxis, rotYAxis, rotZAxis, TAU } from 'points/math';

const vert = /*wgsl*/`

${rotXAxis}
${rotYAxis}
${rotZAxis}
${TAU}

const SCALE = .01;

@vertex
fn main(in: VertexIn) -> FragmentIn {
    let joint = vec4u(joints[in.vertexIndex]);
    let weight = weights[in.vertexIndex];

    let skinMatrix =
        weight.x * boneMatrices[joint.x] +
        weight.y * boneMatrices[joint.y] +
        weight.z * boneMatrices[joint.z] +
        weight.w * boneMatrices[joint.w];

    // var angleZ = params.time * 0.9854;
    var angleY = params.time * 0.94222;
    // var angleX = params.time * 0.865;

    let rotX = rotXAxis(0);
    let rotY = rotYAxis(angleY);
    let rotZ = rotZAxis(0);
    let model = rotX * rotY * rotZ;


    // let skinnedPosition = skinMatrix * vec4f(in.position.xyz, 1);
    // let skinnedNormal   = (skinMatrix * vec4f(in.normal, 0.0)).xyz;

    let world = (model * skinMatrix * vec4f(in.position.xyz, 1)).xyz;
    let clip = camera.camera_projection * camera.camera_view * vec4f(world, 1.);

    let newNormal = normalize((model * skinMatrix * vec4f(in.normal, 0.)).xyz);

    var dvb = defaultVertexBody(clip, in.color, in.uv, newNormal);
    dvb.id = in.id;

    return dvb;
}
`;

export default vert;
