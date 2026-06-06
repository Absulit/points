import { rotXAxis, rotYAxis, rotZAxis, TAU } from 'points/math';

const vert = /*wgsl*/`

${rotXAxis}
${rotYAxis}
${rotZAxis}
${TAU}

const SCALE = .01;

@vertex
fn main(in: VertexIn) -> FragmentIn {
    let joint = joints[in.vertexIndex];
    let weight = weights[in.vertexIndex];

    let skinMatrix =
        boneMatrices[joint.x] * weight.x +
        boneMatrices[joint.y] * weight.y +
        boneMatrices[joint.z] * weight.z +
        boneMatrices[joint.w] * weight.w;

    let skinnedPosition = skinMatrix * vec4f(in.position.xyz, 1.0);
    let skinnedNormal   = skinMatrix * vec4f(in.normal.xyz,   0.0);

    let rotX = rotXAxis(-TAU * 0.25);
    let rotY = rotYAxis(TAU * 0.5);
    let rotZ = rotZAxis(0.0);
    let modelMatrix = rotX * rotY * rotZ;

    let worldPosition = (modelMatrix * skinnedPosition).xyz * SCALE;

    let clip = camera.camera_projection * camera.camera_view * vec4f(worldPosition, 1.0);

    let newNormal = normalize((modelMatrix * skinnedNormal).xyz);

    var dvb = defaultVertexBody(clip, in.color, in.uv, newNormal);
    dvb.id = in.id;

    return dvb;
}
`;

export default vert;
