import defaultStructs from './defaultStructs.js';

const demo6_textureFrag = /*wgsl*/`

${defaultStructs}

struct Particle{
    x: f32,
    y: f32
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage> particles: array<Particle>;

@group(0) @binding(2) var feedbackSampler: sampler;
@group(0) @binding(3) var feedbackTexture: texture_2d<f32>;

@group(0) @binding(4) var computeTexture: texture_2d<f32>;
@group(0) @binding(5) var<storage> particles2: array<Particle>;

@fragment
fn main(@location(0) Color: vec4<f32>, @location(1) uv: vec2<f32>) -> @location(0) vec4<f32> {
    //return Color;
    //return vec4<f32>(sin(3.0), 0.0, 0.0, 1.0);
    let utime = params.utime;
    let particle = particles[0];
    let particle2 = particles2[0];

    let texColor = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1));
    let texColorCompute = textureSample(computeTexture, feedbackSampler, uv * vec2(1,-1));

    return Color;
}
`;

export default demo6_textureFrag;

