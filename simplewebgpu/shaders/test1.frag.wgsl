@group(0) @binding(0) var<uniform> params: Params;

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


@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: f32,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {


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

