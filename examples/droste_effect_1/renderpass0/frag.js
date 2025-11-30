const frag = /*wgsl*/`

fn opSmoothSubtraction(d1: f32, d2: f32, k: f32) -> f32{
    let h = clamp(.5 - .5 * (d2 + d1) / k, 0., 1.);
    return mix(d2, -d1, h) + k * h * (1. - h);
}

fn smin(d1: f32, d2: f32, k: f32) -> f32{
    let h = max(k-abs(d1-d2), 0.)/k;
    return min(d1, d2) - h*h*h*k*(1./6.);
}

fn sdBox(p:vec3f, b: vec3f) -> f32 {
    let q = abs(p) - b;
    return length(max(q, vec3f(0.) )) + min(max(q.x, max(q.y, q.z)), 0.);
}

fn rot2d(angle: f32) -> mat2x2<f32> {
    let s = sin(angle);
    let c = cos(angle);
    return mat2x2(c, -s, s, c);
}

fn paletteLerp(a:array<vec3f,6>, value:f32) -> vec3f {
    let numElements = 6.;
    let elementPercent = 1 / numElements;
    let index = value / elementPercent;
    let minIndex = i32(floor(index));
    let maxIndex = i32(ceil(index));

    let a0 = a[minIndex];
    let a1 = a[maxIndex];

    return mix(a0, a1, fract(index));
}

fn map(p: vec3f, step:f32) -> f32 {
    // input copy to rotate
    var q = p;
    var qRotated = q.xy * rot2d(params.time * .53);
    q = vec3(qRotated, q.z);

    qRotated = q.xz * rot2d(params.time * .633);
    q = vec3(qRotated, q.y);

    // scale down by 4 with  p*4 and correcting distotrion dividing by 4
    let scale = .5;

    // for repetition
    let boxBase = sdBox(q * scale, vec3(.5)) / scale; // cube sdf
    let boxHollow1 = sdBox(q * scale, vec3(.4,.4, 1.)) / scale; // cube sdf
    let boxHollow2 = sdBox(q * scale, vec3(1.,.4, .4)) / scale; // cube sdf
    let boxHollow3 = sdBox(q * scale, vec3(.4,1., .4)) / scale; // cube sdf

    var box = opSmoothSubtraction(boxHollow1, boxBase, .1);
    box = opSmoothSubtraction(boxHollow2, box, .1);
    box = opSmoothSubtraction(boxHollow3, box, .1);

    let ground = p.y + .75;

    // closest distance to the scene
    return smin(ground, box, 1.);
}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {
    let sliderA = 1.;
    let sliderB = .1116;
    let uv2 = in.uvr * 4 - (vec2(2) * in.ratio); // clip space
    // let m = mouse * 4 - (vec2(2) * in.ratio);
    let m = vec2f(.5, .5) * 4 - (vec2(2) * in.ratio);

    // initialization
    var ro = vec3f(0, 0, -3); // ray origin
    var rd = normalize(vec3(uv2 * sliderB * 5, 1)); // ray direction one ray per uv position

    var t = 0.; // total distance traveled // travel distance

    var col = vec3f();

    // Vertical camera rotation
    let mouseRotY = rot2d(-m.y);
    // ro.xz *= rot2d(-m.x);
    ro = vec3(ro.x, ro.yz * mouseRotY);
    // rd.xz *= rot2d(-m.x);
    rd = vec3(rd.x, rd.yz * mouseRotY);

    // Horizontal camera rotation
    let mouseRotX = rot2d(-m.x);
    // ro.xz *= rot2d(-m.x);
    ro = vec3(ro.xz * mouseRotX, ro.y).xzy;
    // rd.xz *= rot2d(-m.x);
    rd = vec3(rd.xz * mouseRotX, rd.y).xzy;

    // Raymarching
    var i = 0;
    for (; i < 80; i++) {
        let p = ro + rd * t; // position along the ray
        let d = map(p, f32(i)); // current distance to the scene
        t += d; // "march" the ray

        // early stop if close enough, test this .001 value with others to test
        // early stop if too far
        if(d < .001 || d > 100.){
            break;
        }
    }
    let value = (t * sliderA * f32(i) * .005);
    col = paletteLerp(colors, value);

    return vec4(col, 1);
}
`;

export default frag;
