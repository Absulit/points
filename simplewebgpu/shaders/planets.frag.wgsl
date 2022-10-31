

struct Planet {
    radius: f32,
    speed: f32,
    angle: f32,
    x: f32,
    y: f32
}

struct Particles{
    planets: array<Planet>
}

struct Params {
    utime: f32,
    screenWidth:f32,
    screenHeight:f32
}

struct ScreenSize {
    numRows: f32,
    numColumns: f32,
    uTime: f32,
    notFilled: u32,
}

fn fnusin(speed: f32) -> f32{
    return sin(params.utime * speed) * .5;
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
@group(0) @binding(1) var<storage> particles: Particles;

@group(0) @binding(2) var feedbackSampler: sampler;
@group(0) @binding(3) var feedbackTexture: texture_2d<f32>;

@group(0) @binding(4) var computeTexture: texture_2d<f32>;


@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: f32,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let texColor = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1));
    let texColorCompute = textureSample(computeTexture, feedbackSampler, uv * vec2(1,-1));

    let scale = .01;

    var c = 1.;

    //var particle = particles[0];
    var lastDistance = -1.;
    for(var i:u32 = 0; i < 8u; i++){
        var particle = particles.planets[i];
        var d = distance(uv, vec2(particle.x * scale + .5, particle.y * scale + .5));


        if(lastDistance != -1.){
            lastDistance = min(lastDistance, d);
        }else{
            lastDistance = d;
        }
    }
    if(lastDistance > .01){
        c = 0.;
    }

    // var d1 = distance(uv, vec2( .5, .5) );
    // var d2 = distance(uv, vec2( .6, .6) );
    // var d3 = distance(uv, vec2( .7, .7) );
    // var d = min(min(d1,d3), d2);
    // if(d > .1){
    //     c = 0.;
    // }
    // r += c;

    let r = c + lastDistance;
    let g = lastDistance;
    let b = 1 - lastDistance * 32;

    let finalColor:vec4<f32> = vec4(r, g, b, 1 );


    return finalColor;
}

