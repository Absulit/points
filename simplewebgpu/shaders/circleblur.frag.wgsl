@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage> particles: array<Particle>;

struct Particle{
    x: f32,
    y: f32
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

fn sdfSegment(  p:vec2<f32>, a:vec2<f32>, b:vec2<f32> ) -> f32{
    let pa = p-a;
    let ba = b-a;
    let h:f32 = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

fn line2(uv:vec2<f32>, p1:vec2<f32>, p2:vec2<f32>, pixelStroke:f32)->f32{
    let d = sdfSegment(uv, p1, p2);
    var value = 1.0;
    if(d > pixelStroke/800.){
        value = 0.;
    }
    return value;
}


@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: f32,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {


    var particle = particles[0];

    let d = distance(uv, vec2(.5,.5));
    var c = 1.;
    if(d > .1){
        c = 0;
    }


    let finalColor:vec4<f32> = vec4(1,1,1,c);


    return finalColor;
}

