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

    let scale = .1;

    var c = 1.;

    var particle = particles[0];
    var lastDistance = -1.;
    for(var i:u32 = 0; i < 8u; i++){
        var particle = particles[i];
        var d = distance(uv, vec2(particle.x * scale + .5, particle.y * scale + .5));

        if(i > 1u && i < 8u){

        }

        if(lastDistance != -1.){

            let p1 = particles[i - 1];
            let p2 = particles[i];
            let dSegment = sdfSegment(uv, vec2(p1.x * scale + .5,p1.y * scale + .5), vec2(p2.x * scale + .5,p2.y * scale + .5));
            d = min(dSegment, d);


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
    let g = lastDistance * uv.x * uv.y * fnusin(uv.x) * 10;
    let b = 1 - lastDistance * uv.y * 32 * uv.x;

    let finalColor:vec4<f32> = vec4(b, r, g, 1 );


    return finalColor;
}

