export const fnusin = /*wgsl*/`

fn fnusin(speed: f32) -> f32{
    return sin(params.utime * speed) * .5;
}

`;

export const fusin = /*wgsl*/`

fn fusin(speed: f32) -> f32{
    return sin(params.utime * speed);
}

`;

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