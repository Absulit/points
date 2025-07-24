// original: Author :  Stefan Gustavson (stefan.gustavson@liu.se)
// https://github.com/ashima/webgl-noise/blob/master/src/classicnoise2D.glsl

const auxiliars = /*wgsl*/`
fn mod289(x:vec4<f32>) -> vec4<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn permute(x:vec4<f32>) -> vec4<f32> {
  return mod289(((x*34.0)+10.0)*x);
}

fn taylorInvSqrt(r:vec4<f32>) -> vec4<f32> {
  return 1.79284291400159 - 0.85373472095314 * r;
}

fn fade(t:vec2<f32>) -> vec2<f32> {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}
`;

/**
 * @type {String}
 * Classic Perlin Noise
 * @param {vec2f} P point
 * @return `f32`
 */
const cnoise = /*wgsl*/`
${auxiliars}

// Classic Perlin noise
fn cnoise(P:vec2<f32>) ->f32 {
    var Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    let Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod289(Pi); // To avoid truncation effects in permutation
    let ix = Pi.xzxz;
    let iy = Pi.yyww;
    let fx = Pf.xzxz;
    let fy = Pf.yyww;

    let i = permute(permute(ix) + iy);

    var gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
    let gy = abs(gx) - 0.5 ;
    let tx = floor(gx + 0.5);
    gx = gx - tx;

    var g00 = vec2(gx.x,gy.x);
    var g10 = vec2(gx.y,gy.y);
    var g01 = vec2(gx.z,gy.z);
    var g11 = vec2(gx.w,gy.w);

    var norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;

    let n00 = dot(g00, vec2(fx.x, fy.x));
    let n10 = dot(g10, vec2(fx.y, fy.y));
    let n01 = dot(g01, vec2(fx.z, fy.z));
    let n11 = dot(g11, vec2(fx.w, fy.w));

    let fade_xy = fade(Pf.xy);
    let n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    let n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}
`;
/**
 * @type {String}
 * Classic Perlin Noise, periodic variant
 * @param {vec2f} P point
 * @param {vec2f} rep point
 * @return `f32`
 */
const pnoise = /*wgsl*/`
${auxiliars}

// Classic Perlin noise, periodic variant
fn pnoise(P:vec2<f32>, rep:vec2<f32>) -> f32 {
    var Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    let Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = Pi % rep.xyxy; // To create noise with explicit period
    Pi = mod289(Pi);        // To avoid truncation effects in permutation
    let ix = Pi.xzxz;
    let iy = Pi.yyww;
    let fx = Pf.xzxz;
    let fy = Pf.yyww;

    let i = permute(permute(ix) + iy);

    var gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
    let gy = abs(gx) - 0.5 ;
    let tx = floor(gx + 0.5);
    gx = gx - tx;

    var g00 = vec2(gx.x,gy.x);
    var g10 = vec2(gx.y,gy.y);
    var g01 = vec2(gx.z,gy.z);
    var g11 = vec2(gx.w,gy.w);

    let norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;

    let n00 = dot(g00, vec2(fx.x, fy.x));
    let n10 = dot(g10, vec2(fx.y, fy.y));
    let n01 = dot(g01, vec2(fx.z, fy.z));
    let n11 = dot(g11, vec2(fx.w, fy.w));

    let fade_xy = fade(Pf.xy);
    let n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    let n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}
`;

export { cnoise, pnoise };
