// original: Author :  Stefan Gustavson (stefan.gustavson@liu.se)
// https://github.com/ashima/webgl-noise/blob/master/src/cellular2D.glsl

/**
 * @type {String}
 * Cellular noise
 * @param {vec2f} P position
 * @return `vec2f`
 */

const cellular = /*wgsl*/`
// Modulo 289 without a division (only multiplications)
fn mod289_v3(x:vec3<f32>) -> vec3<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289(x: vec2<f32>) -> vec2<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

// Modulo 7 without a division
fn mod7(x:vec3<f32>) -> vec3<f32> {
    return x - floor(x * (1.0 / 7.0)) * 7.0;
}

// Permutation polynomial: (34x^2 + 6x) mod 289
fn permute(x: vec3<f32>) -> vec3<f32> {
    return mod289_v3((34.0 * x + 10.0) * x);
}

// Cellular noise, returning F1 and F2 in a vec2.
// Standard 3x3 search window for good F1 and F2 values
const K = 0.142857142857; // 1/7
const Ko = 0.428571428571; // 3/7
const jitter = 1.0; // Less gives more regular pattern

fn cellular(P:vec2<f32>) -> vec2<f32> {
    let Pi:vec2<f32> = mod289(floor(P));
    let Pf:vec2<f32> = fract(P);
    let oi:vec3<f32> = vec3(-1.0, 0.0, 1.0);
    let of_:vec3<f32> = vec3(-0.5, 0.5, 1.5);
    let px:vec3<f32> = permute(Pi.x + oi);
    var p:vec3<f32> = permute(px.x + Pi.y + oi); // p11, p12, p13
    var ox:vec3<f32> = fract(p*K) - Ko;
    var oy:vec3<f32> = mod7(floor(p*K))*K - Ko;
    var dx:vec3<f32> = Pf.x + 0.5 + jitter*ox;
    var dy:vec3<f32> = Pf.y - of_ + jitter*oy;
    var d1:vec3<f32> = dx * dx + dy * dy; // d11, d12 and d13, squared
    p = permute(px.y + Pi.y + oi); // p21, p22, p23
    ox = fract(p*K) - Ko;
    oy = mod7(floor(p*K))*K - Ko;
    dx = Pf.x - 0.5 + jitter*ox;
    dy = Pf.y - of_ + jitter*oy;
    var d2 = dx * dx + dy * dy; // d21, d22 and d23, squared
    p = permute(px.z + Pi.y + oi); // p31, p32, p33
    ox = fract(p*K) - Ko;
    oy = mod7(floor(p*K))*K - Ko;
    dx = Pf.x - 1.5 + jitter*ox;
    dy = Pf.y - of_ + jitter*oy;
    let d3 = dx * dx + dy * dy; // d31, d32 and d33, squared
    // Sort out the two smallest distances (F1, F2)
    let d1a = min(d1, d2);
    d2 = max(d1, d2); // Swap to keep candidates for F2
    d2 = min(d2, d3); // neither F1 nor F2 are now in d3
    d1 = min(d1a, d2); // F1 is now in d1
    d2 = max(d1a, d2); // Swap to keep candidates for F2

    //d1.xy = (d1.x < d1.y) ? d1.xy : d1.yx; // Swap if smaller
    if(d1.x < d1.y){
        //d1.xy = d1.xy;
    }else{
        //d1.xy = d1.yx;
        d1 = vec3(d1.yx, d1.z);
    }

    //d1.xz = (d1.x < d1.z) ? d1.xz : d1.zx; // F1 is in d1.x
    if(d1.x < d1.z){

    }else{
        //d1.xz = d1.zx;
        d1 = vec3(d1.z, d1.y, d1.x);
    }


    //d1.yz = min(d1.yz, d2.yz); // F2 is now not in d2.yz
    d1 = vec3(d1.x, min(d1.yz, d2.yz));

    d1.y = min(d1.y, d1.z); // nor in  d1.z
    d1.y = min(d1.y, d2.x); // F2 is in d1.y, we're done.
    return sqrt(d1.xy);
}
`;

export { cellular };
