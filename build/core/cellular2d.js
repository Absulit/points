/* @ts-self-types="./cellular2d.d.ts" */
/**
 * original: Author :  Stefan Gustavson (stefan.gustavson@liu.se)<br>
 * https://github.com/ashima/webgl-noise/blob/master/src/cellular2D.glsl<br>
 *<br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/cellular2d
 */

/**
 * Cellular noise
 * @type {String}
 * @param {vec2f} P position
 * @returns {vec2f} noise in the specified position
 *
 * @example
 * // js
 * import { cellular } from 'points/cellular2d';
 *
 * // wgsl string
 * ${cellular}
 * let value = cellular(uvr);
 *
 */

const cellular = /*wgsl*/`fn mod289_v3(x:vec3f)->vec3f{return x-floor(x*(1.0 / 289.0))*289.0;}fn mod289(x:vec2f)->vec2f{return x-floor(x*(1.0 / 289.0))*289.0;}fn mod7(x:vec3f)->vec3f{return x-floor(x*(1.0 / 7.0))*7.0;}fn permute(x:vec3f)->vec3f{return mod289_v3((34.0*x+10.0)*x);}const K=0.142857142857;const Ko=0.428571428571;const jitter=1.0;fn cellular(P:vec2f)->vec2f{let Pi:vec2f=mod289(floor(P));let Pf:vec2f=fract(P);let oi:vec3f=vec3(-1.0,0.0,1.0);let of_:vec3f=vec3(-0.5,0.5,1.5);let px:vec3f=permute(Pi.x+oi);var p:vec3f=permute(px.x+Pi.y+oi);var ox:vec3f=fract(p*K)-Ko;var oy:vec3f=mod7(floor(p*K))*K-Ko;var dx:vec3f=Pf.x+0.5+jitter*ox;var dy:vec3f=Pf.y-of_+jitter*oy;var d1:vec3f=dx*dx+dy*dy;p=permute(px.y+Pi.y+oi);ox=fract(p*K)-Ko;oy=mod7(floor(p*K))*K-Ko;dx=Pf.x-0.5+jitter*ox;dy=Pf.y-of_+jitter*oy;var d2=dx*dx+dy*dy;p=permute(px.z+Pi.y+oi);ox=fract(p*K)-Ko;oy=mod7(floor(p*K))*K-Ko;dx=Pf.x-1.5+jitter*ox;dy=Pf.y-of_+jitter*oy;let d3=dx*dx+dy*dy;let d1a=min(d1,d2);d2=max(d1,d2);d2=min(d2,d3);d1=min(d1a,d2);d2=max(d1a,d2);if(d1.x < d1.y){}else{d1=vec3(d1.yx,d1.z);}if(d1.x < d1.z){}else{d1=vec3(d1.z,d1.y,d1.x);}d1=vec3(d1.x,min(d1.yz,d2.yz));d1.y=min(d1.y,d1.z);d1.y=min(d1.y,d2.x);return sqrt(d1.xy);}`;

export { cellular };
