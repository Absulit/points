import { PI } from 'points/math';
import { rand } from 'points/random';

const frag = /*wgsl*/`

${PI}
${rand}

const NUMOBJECTS = 10;
const RADIAN = 0.0174533;
const sliderA = -.549;
const sliderB = .111;
const sliderC = .685;

fn smin(d1: f32, d2: f32, k: f32) -> f32{
    let h = max(k-abs(d1-d2), 0.)/k;
    return min(d1, d2) - h*h*h*k*(1./6.);
}

fn sdSphere(p:vec3f, s:f32) -> f32{
    return length(p) - s;
}

struct Variables {
    init: i32,
}

struct Object {
    position: vec3f,
    currentPosition: vec3f,
    vertical: f32,
    color: vec3f,
    colorResult: vec3f,
    offset: f32,
    scale: f32,
    speed: f32,
    sdf: f32,
}

struct RayInfo{
    distance: f32,
    color: vec3f,
}

fn map(p: vec3f, step:f32) -> RayInfo {
    let ground = p.y + 1.5;
    let roof = p.y - 1.5;

    var result = 1.;
    var o = Object();
    for (var i = 0; i < NUMOBJECTS; i++) {
        o = objects[i];
        let animPosition = o.position + vec3f(0, sin(params.time * o.speed) * o.vertical, 0);
        o.currentPosition = animPosition;
        o.sdf = sdSphere(p - animPosition, o.scale); // sphere sdf

        result = smin(result, o.sdf, .530);
        o.colorResult = mix(o.color, o.colorResult, result);
    }
    let info = RayInfo(smin(ground, result, 1.), o.colorResult);
    return info;
}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    rand_seed.x = .01835255;
    if(variables.init == 0){
        for (var i = 0; i < NUMOBJECTS; i++) {
            var o = Object();
            rand();
            o.position = vec3f(rand_seed * 4 - 2, rand() - .5);
            o.scale = rand_seed.x;
            rand();
            o.vertical = .1 + rand_seed.y;
            o.offset = rand_seed.x;
            rand();
            o.speed = .1 + rand_seed.x;
            rand();
            o.color = vec3f(rand_seed, rand());
            objects[i] = o;
        }
        variables.init = 1;
    }

    let uv2 = in.uvr * 4 - (vec2(2) * in.ratio); // clip space
    let m = in.mouse * 4 - (vec2(2) * in.ratio);

    // initialization
    var ro = vec3f(0, 0, -3); // ray origin
    var rd = normalize(vec3(uv2 * sliderB * 5, 1)); // ray direction one ray per uv position
    var t = 0.; // total distance traveled // travel distance
    var col = vec3f();

    // Raymarching
    var i = 0;
    var rayValue = 0.;
    var d = RayInfo();
    for (; i < 80; i++) {
        let p = ro + rd * t; // position along the ray
        d = map(p, f32(i)); // current distance to the scene
        t += d.distance; // "march" the ray

        // early stop if close enough, test this .001 value with others to test
        // early stop if too far
        if(d.distance < .001 || d.distance > 100.){
            break;
        }
    }
    rayValue = f32(i) / 80.; // to visualize the ray
    var a = (1-rayValue * t * sliderA);

    var selectedColor = vec3f();
    var lastDistance = 1000.;
    for (var i = 0; i < NUMOBJECTS ; i++) {
        let o = objects[i];
        if( distance(o.currentPosition, rd) > 0){
            selectedColor = mix(o.color, selectedColor, rd);
        }
    }

    return vec4( selectedColor * a, 1);
}
`;

export default frag;
