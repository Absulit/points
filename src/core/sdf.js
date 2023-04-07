/**
 * A few signed distance functions
 */

export const sdfSegment = /*wgsl*/`
fn sdfSegment(p:vec2<f32>, a:vec2<f32>, b:vec2<f32> ) -> f32{
    let pa = p-a;
    let ba = b-a;
    let h:f32 = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}
`;

export const sdfLine = /*wgsl*/`
fn sdfLine(p1:vec2<f32>, p2:vec2<f32>, pixelStroke:f32, uv:vec2<f32>)->f32{
    let d = sdfSegment(uv, p1, p2);
    var value = 1.0;
    if(d > pixelStroke/800.){
        value = 0.;
    }
    return value;
}
`;

/**
 * Creates a circle
 * @param {vec2<f32>} position
 * @param {f32} radius
 * @param {f32} feather
 * @param {vec2<f32>} uv
 */
export const sdfCircle = /*wgsl*/`
fn sdfCircle(position:vec2<f32>, radius: f32, feather: f32, uv:vec2<f32>) -> f32 {
    let d = distance(uv, position);
    let st = 1 - smoothstep(radius, radius + feather, d);
    return st;
}
`;

export const sdfSquare = /*wgsl*/`
fn sdfSquare(position:vec2<f32>, radius:f32, feather:f32, rotationRads: f32, uv:vec2<f32>) -> f32 {
    let positionRotated = rotateVector(position, rotationRads);
    let uvRotated = rotateVector(uv, rotationRads);

    var d = distance(uvRotated.x,  positionRotated.x );
    var s = smoothstep(radius, radius + feather,  d);

    d = distance(uvRotated.y,  positionRotated.y);
    s += smoothstep(radius, radius + feather,  d);
    s = clamp(0,1, s);
    return 1-s;
}
`;

export const sdfRectangle = /*wgsl*/`

`;

export const sdfLine2 = /*wgsl*/`
fn sdfLine2(p1:vec2<f32>, p2:vec2<f32>, feather:f32, uv:vec2<f32>)->f32{
    let d = sdfSegment(uv, p1, p2);
    var s = smoothstep(0, feather,  d);
    return 1-s;
}
`;

/**
 * Special for letters and create an sdf version of a texture
 */
export const sdfSmooth = /*wgsl*/`
fn sdfSmooth(color:vec4<f32>) -> vec4<f32> {
    var finalColor = color;
    var spread = fwidth(finalColor.a);
    spread = max(spread * .75, .001);
    finalColor.a = smoothstep(.5 - spread, .5 + spread, finalColor.a);

    // if(finalColor.a <= 0.){
    //     discard;
    // }
    return finalColor;
}
`;