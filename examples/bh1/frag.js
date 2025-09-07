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

fn sdfDisk(p:vec3f, innerRadius:f32, outerRadius:f32, thickness:f32) -> f32 {
    let radialDist = length(vec2f(p.x, p.z));
    let verticalDist = abs(p.y);
    let inRing = max(innerRadius - radialDist, radialDist - outerRadius);
    return max(inRing, verticalDist - thickness);
}

fn impactParameter(r:f32, M:f32) -> f32 {
  return r / sqrt(1 - (2 * M) / r);
}

fn bendRay(rayDir: vec3f, rayPos: vec3f, blackHolePos: vec3f, mass: f32) -> vec3f {
    let toBH = normalize(blackHolePos - rayPos);
    let dist = length(blackHolePos - rayPos);
    // let gravity = mass / (dist * dist); // inverse square falloff
    let epsilon = .01;
    let gravity = clamp(mass / (dist * dist + epsilon), 0.0, 0.2);// limit bending near horizon
    return normalize(rayDir + gravity * toBH);
}

fn map(p:vec3f, step:f32) -> f32 {
    // input copy to rotate
    var q = p;
    var qRotated = q.xy * rot2d(params.time * .53);
    q = vec3(qRotated, q.z);

    qRotated = q.xz * rot2d(params.time * .633);
    q = vec3(qRotated, q.y);

    // scale down by 4 with  p*4 and correcting distotrion dividing by 4
    let scale = .5;

    // for repetition
    // let boxBase = sdBox(q * scale, vec3(.5)) / scale; // cube sdf
    // let ground = p.y + .75;

    let disk = sdfDisk(p, params.innerRadius, params.outerRadius, .01);

    // closest distance to the scene
    return disk;
}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {
    let sliderA = params.sliderA; // 1.;
    let sliderB = params.sliderB; // .1116;
    let uv2 = uvr * 4 - (vec2(2) * ratio); // clip space
    // let m = mouse * ratio * 4 - (vec2(2) * ratio);
    let m = vec2f(0, params.mouseY) * ratio * 4 - (vec2(2) * ratio);
    // let m = vec2f(.5, .5) * 4 - (vec2(2) * ratio);

    // initialization
    var ro = vec3f(0, 0, params.roDistance); // ray origin
    var rd = normalize(vec3(uv2 * sliderB * 5, 1)); // ray direction one ray per uv position

    var t = 0.; // total distance traveled // travel distance

    var col = vec3f();

    // Vertical camera rotation
    let mouseRotY = rot2d(-m.y);
    ro = vec3(ro.x, ro.yz * mouseRotY); // ro.xz *= rot2d(-m.x);
    rd = vec3(rd.x, rd.yz * mouseRotY); // rd.xz *= rot2d(-m.x);

    let mouseRotX = rot2d(-m.x); // Horizontal camera rotation
    ro = vec3(ro.xz * mouseRotX, ro.y).xzy; // ro.xz *= rot2d(-m.x);
    rd = vec3(rd.xz * mouseRotX, rd.y).xzy; // rd.xz *= rot2d(-m.x);

    // Raymarching
    var i = 0;

    var hitDisk = false;
    var finalP = vec3f(0.0); // to store the hit position

    for (; i < 80; i++) {
        let p = ro + rd * t; // position along the ray
        if(params.enabled == 1){
            rd = bendRay(rd, ro + rd * t, vec3f(0, 0, 0), params.mass); // mass = 1.0 for now

            // let bend = bendRay(rd, ro + rd * t, vec3f(0, 0, 0), params.mass); // mass = 1.0 for now
            // rd = normalize(mix(rd, bend, 0.5)); // smooth transition
        }
        let d = map(p, f32(i)); // current distance to the scene
        // t += d; // "march" the ray
        // t += d * .5; // "march" the ray
        t += min(d, 0.1);

        // early stop if close enough, test this .001 value with others to test
        // early stop if too far
        if (d < .001 || t > 100.0) {
            hitDisk = d < .001;
            finalP = p;
            break;
        }
    }
    var value = (t * sliderA * f32(i) * params.sliderC); // sliderC .005)

    if (hitDisk) {
        let v = normalize(vec3f(-finalP.z, 0.0, finalP.x)); // tangential velocity
        let toObserver = normalize(ro - finalP);
        let beta = params.diskSpeed; // .1 - .9
        // let gamma = 1.0 / sqrt(1.0 - beta * beta);
        let gamma = clamp(1.0 / sqrt(1.0 - beta * beta), 1.0, 10.0); // clamp gama for safety
        let cosTheta = dot(v, toObserver);
        let dopplerFactor = 1.0 / (gamma * (1.0 - beta * cosTheta));
        // let dopplerBoost = clamp(dopplerFactor, 0.5, 2.0);
        let dopplerBoost = clamp(dopplerFactor * 2.0, 0.5, 4.0);

        value *= dopplerBoost;
        value += dopplerBoost * 0.3; // optional hue shift
    }

    col = paletteLerp(colors, value);

    return vec4(col, 1);
}
`;

export default frag;
