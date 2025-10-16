/* @ts-self-types="./classicnoise3d.d.ts" */
/**
 * original: Author :  Stefan Gustavson (stefan.gustavson@liu.se)<br>
 * https://github.com/ashima/webgl-noise/blob/master/src/classicnoise3D.glsl<br>
 *<br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/classicnoise3d
 */


/**
 * Classic Perlin noise, periodic variant
 * @type {String}
 * @param {vec3f} P position
 * @returns {f32}
 *
 * @example
 * // js
 * import { pnoise3 } from 'points/classicnoise3d';
 *
 * // wgsl string
 * ${pnoise3}
 * let value = pnoise3(xyz);
 */

const pnoise3 = /*wgsl*/`

fn mod289_v3(x: vec3f) -> vec3f {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289_v4(x: vec4f) -> vec4f {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn taylorInvSqrt(r:vec4f) -> vec4f {
    return 1.79284291400159 - 0.85373472095314 * r;
}

fn fade(t:vec3f) -> vec3f {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

fn permute4(x:vec4f) -> vec4f{
    return mod289_v4(((x*34.0)+1.0)*x);
}

fn pnoise3(P:vec3f, rep:vec3f) -> f32 {
    var Pi0 = floor(P) % rep; // Integer part, modulo period
    var Pi1 = (Pi0 + vec3(1.0)) % rep; // Integer part + 1, mod period
    Pi0 = mod289_v3(Pi0);
    Pi1 = mod289_v3(Pi1);
    let Pf0 = fract(P); // Fractional part for interpolation
    let Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    let ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    let iy = vec4(Pi0.yy, Pi1.yy);
    let iz0 = Pi0.zzzz;
    let iz1 = Pi1.zzzz;

    let ixy = permute4(permute4(ix) + iy);
    let ixy0 = permute4(ixy + iz0);
    let ixy1 = permute4(ixy + iz1);

    var gx0 = ixy0 * (1.0 / 7.0);
    var gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    let gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    let sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(vec4f(), gx0) - 0.5);
    gy0 -= sz0 * (step(vec4f(), gy0) - 0.5);

    var gx1 = ixy1 * (1.0 / 7.0);
    var gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    let gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    let sz1 = step(gz1, vec4());
    gx1 -= sz1 * (step(vec4f(), gx1) - 0.5);
    gy1 -= sz1 * (step(vec4f(), gy1) - 0.5);

    var g000 = vec3(gx0.x,gy0.x,gz0.x);
    var g100 = vec3(gx0.y,gy0.y,gz0.y);
    var g010 = vec3(gx0.z,gy0.z,gz0.z);
    var g110 = vec3(gx0.w,gy0.w,gz0.w);
    var g001 = vec3(gx1.x,gy1.x,gz1.x);
    var g101 = vec3(gx1.y,gy1.y,gz1.y);
    var g011 = vec3(gx1.z,gy1.z,gz1.z);
    var g111 = vec3(gx1.w,gy1.w,gz1.w);

    let norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    let norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    let n000 = dot(g000, Pf0);
    let n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    let n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    let n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    let n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    let n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    let n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    let n111 = dot(g111, Pf1);

    let fade_xyz = fade(Pf0);
    let n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    let n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    let n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}
`;

export { pnoise3 };
