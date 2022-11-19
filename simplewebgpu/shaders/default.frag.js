const defaultFrag = /*wgsl*/`

struct Particle{
    x: f32,
    y: f32
}

struct Params {
    utime: f32,
    screenWidth:f32,
    screenHeight:f32,
    mouseX: f32,
    mouseY: f32,
    sliderA: f32,
    sliderB: f32,
    sliderC: f32
}

fn fnusin(speed: f32) -> f32{
    return sin(params.utime * speed) * .5;
}
fn fusin(speed: f32) -> f32{
    return sin(params.utime * speed);
}

// float sdfSegment( in vec2 p, in vec2 a, in vec2 b ){
//     vec2 pa = p-a, ba = b-a;
//     float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
//     return length( pa - ba*h );
// }

// float line(vec2 uv, vec2 p1, vec2 p2, float pixelStroke){
//     vec2 v1 = vec2(p1.x/screenWidth, 1.-p1.y/screenWidth);
//     vec2 v2 = vec2(p2.x/screenHeight, 1.-p2.y/screenHeight);
//     float d = sdfSegment(uv, v1, v2);
//     float value = 1.0;
//     if(d > pixelStroke/800.){
//         value = 0.;
//     }
//     return value;
// }

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

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(uv.x  * cellSize) * sin(uv.y * cellSize);
    let b = sin(uv.x * uv.y * 10. * 9.1 * .25 );
    let c = fnusin(uv.x * uv.y * 10.);
    let d = distance(a,b);
    let f = d * uv.x * uv.y;
    let finalColor:vec4<f32> = vec4(a*d,f*c*a,f, 1.);





    return finalColor;
}
`;

export default defaultFrag;

