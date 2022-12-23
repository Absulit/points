export const random = /*wgsl*/`

var<private> a = 1664525;
var<private> c = 1013904223;
var<private> m = pow(2, 32);
var<private> seed = 958736;

fn nextRand() -> i32 {
    seed = (a * seed + c) % i32(m);
    return seed;
}

fn random() -> f32 {
    return f32(nextRand()) / f32(m) / .5;
}

`;
