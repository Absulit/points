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

    let skinnedPosition = skinMatrix * vec4f(in.position.xyz, 1);
    let skinnedNormal   = mat3x3f(skinMatrix[0].xyz, skinMatrix[1].xyz, skinMatrix[2].xyz) * in.normal;

    let clip = camera.camera_projection * camera.camera_view * skinnedPosition;

    let newNormal = normalize(in.normal);

    var dvb = defaultVertexBody(clip, in.color, in.uv, newNormal);
    dvb.id = in.id;

    return dvb;
}
`;

export default vert;
