import defaultStructs from './defaultStructs.js';

const random1Compute = /*wgsl*/`

${defaultStructs}

struct Variables{
    testValue: f32
}

struct Chemical{
    a: f32,
    b: f32
}

struct Particles{
    chemicals: array<Chemical>
}

@group(0) @binding(0) var <storage, read_write> layer0: Points;
@group(0) @binding(1) var feedbackSampler: sampler;
@group(0) @binding(2) var feedbackTexture: texture_2d<f32>;
@group(0) @binding(3) var outputTex : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(4) var <storage, read_write> variables: Variables;
@group(0) @binding(5) var <storage, read_write> particles: Particles;
@group(0) @binding(6) var <uniform> params: Params;
@group(0) @binding(7) var <storage, read_write> particles2: Particles;


@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    var l0 = layer0.points[0];
    let utime = params.utime;
    let chemical = particles.chemicals[0];
    let chemical2 = particles2.chemicals[0];
    let tv: ptr<storage, f32, read_write> = &variables.testValue;

    let dims: vec2<u32> = textureDimensions(feedbackTexture, 0);
    var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2(0),  0.0).rgba;

    textureStore(outputTex, vec2<u32>(0,0), rgba);
}
`;

export default random1Compute;
