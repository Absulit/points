// original: Author : Ian McEwan, Ashima Arts.
// https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl

/**
 * @type {String}
 * Noise
 * @param {vec2f} v usually the uv
 * @return `f32`
 */

const snoise = /*wgsl*/`

fn mod289_v3(x: vec3<f32>) -> vec3<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289_v2(x: vec2<f32>) -> vec2<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn permute(x: vec3<f32>) -> vec3<f32> {
    return mod289_v3(((x*34.0)+10.0)*x);
}

fn snoise(v:vec2<f32>) -> f32 {
    let C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    // First corner
    var i  = floor(v + dot(v, C.yy) );
    var x0 = v -   i + dot(i, C.xx);

    // Other corners
    var i1 = vec2(0.);
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    //i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    if(x0.x > x0.y){ i1 = vec2(1.0, 0.0); }else{ i1 = vec2(0.0, 1.0); }
    //x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    var x12 = x0.xyxy + C.xxzz;
    //x12.xy -= i1;
    x12 = vec4(x12.xy - i1, x12.zw); // ?? fix

    // Permutations
    i = mod289_v2(i); // Avoid truncation effects in permutation
    let p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));

    var m = max(vec3(0.5) - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), vec3(0.0));
    m = m*m ;
    m = m*m ;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

    let x = 2.0 * fract(p * C.www) - 1.0;
    let h = abs(x) - 0.5;
    let ox = floor(x + 0.5);
    let a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    // Compute final noise value at P
    var g = vec3(0.);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    //g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    g = vec3(g.x,a0.yz * x12.xz + h.yz * x12.yw);
    return 130.0 * dot(m, g);
  }
`;

export { snoise };
