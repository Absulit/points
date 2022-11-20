import defaultStructs from './defaultStructs.js';

const test1Frag = /*wgsl*/`

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
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: f32,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let particle = particles[0];
    let particle2 = particles2[0];

    let texColor = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1));
    let texColorCompute = textureSample(computeTexture, feedbackSampler, uv * vec2(1,-1));

    let cellSize = 300.;
    let a = sin(uv.x  * cellSize) * sin(uv.y * cellSize);
    let points = a * a * 10; // to use in alpha

    // const centerClone = screen.center.clone();
    // centerClone.x *= fusin(1.1556) * 2;

    // const d = MathUtil.distance(centerClone, point.coordinates) / side;
    // const b = Math.sin(200 * nx * ny * d * (1 - nx) + fnusin(5) * 10);
    // point.modifyColor(color => color.set(1 - nx * b, (ny * -b), 0) );

    let center = vec2(.5 * ratio * fusin(1.1556) * 2.,.5);
    let d = distance(center, uv);// / params.screenHeight;
    let b = sin(200 * uv.x * uv.y * d * (1-uv.x) + fnusin(5) * 10);

    //let finalColor:vec4<f32> = vec4(1,1,1, points);
    let finalColor:vec4<f32> = vec4(1. - uv.x * b, (uv.y * -b), 0., 1);

    return finalColor;
}
`;

export default test1Frag;
