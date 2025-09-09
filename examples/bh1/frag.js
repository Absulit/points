import { fnusin, fusin } from "points/animation";
import { texture } from "points/image";
import { PI } from "points/math";

const frag = /*wgsl*/`

${fnusin}
${fusin}
${texture}
${PI}

fn rot2d(angle: f32) -> mat2x2<f32> {
    let s = sin(angle);
    let c = cos(angle);
    return mat2x2(c, -s, s, c);
}

fn paletteLerp(a:array<vec4f,6>, value:f32) -> vec4f {
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

fn bendRay(rayDir: vec3f, rayPos: vec3f, blackHolePos: vec3f, mass: f32, spin:f32) -> vec3f {
    let toBH = normalize(blackHolePos - rayPos);
    let dist = length(blackHolePos - rayPos);
    // let gravity = mass / (dist * dist); // inverse square falloff
    let epsilon = .01;
    // let gravity = clamp(mass / (dist * dist + epsilon), 0.0, 0.2);// limit bending near horizon
    let gravity = clamp(mass / (dist * sqrt(dist + epsilon)), 0.0, 0.2); // smoother falloff
    // return normalize(rayDir + gravity * toBH);


    // Frame dragging: add tangential swirl
    let tangent = normalize(vec3f(-toBH.z, 0.0, toBH.x)); // perpendicular in XZ plane
    let dragging = spin / (dist + 0.01); // stronger near BH

    return normalize(rayDir + gravity * toBH + dragging * tangent);
}

fn map(p:vec3f, step:f32) -> f32 {
    var q = p;
    let disk = sdfDisk(p, params.innerRadius, params.outerRadius, .004);
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
    let scale = params.scale; // .1116;
    let uv2 = uvr * 4 - (vec2(2) * ratio); // clip space
    // let m = mouse * ratio * 4 + (vec2(.5) * ratio);
    // let m = vec2f(0, params.mouseY) * ratio * 4 - (vec2(2) * ratio);
    let m = vec2f(0, fusin(.3) * .05 ) * ratio * 4 - vec2(-3); // -.2
    // let m = vec2f(.5, .5) * 4 - (vec2(2) * ratio);

    // initialization
    var ro = vec3f(0, 0, fusin(.15) * 1 +  -4.3/*params.roDistance*/); // ray origin
    var rd = normalize(vec3(uv2 * scale * 5, 1)); // ray direction one ray per uv position

    var t = 0.; // total distance traveled // travel distance

    var col = vec4f();

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
    var finalP = vec3f(); // to store the hit position

    let eventHorizon = params.eventHorizon * params.mass; // 2.0
    var fellIntoBlackHole = false;

    for (; i < 128; i++) {
        let p = ro + rd * t; // position along the ray
        let r = length(p); // distance from black hole center
        if (r < eventHorizon) {
            fellIntoBlackHole = true;
            break; // ray fell into the black hole
        }

        if(params.enabled == 1){
            rd = bendRay(rd, ro + rd * t, vec3f(), params.mass, params.spin); // mass = 1.0 for now
            // let bend = bendRay(rd, ro + rd * t, vec3f(0, 0, 0), params.mass, params.spin); // mass = 1.0 for now
            // rd = normalize(mix(rd, bend, 0.5)); // smooth transition
        }

        let d = map(p, f32(i)); // current distance to the scene
        // t += d; // "march" the ray
        // t += d * .5; // "march" the ray
        // t += min(d, 0.1);// "march" the ray

        // Check if we're near the disk vertically
        let nearDisk = abs(d) < 0.04;

        // Use smaller step size near the disk to reduce banding
        if (nearDisk) {
            t += max(d, 0.01); // finer steps
        } else {
            t += min(d, 0.1);  // normal steps
        }

        // early stop if close enough, test this .001 value with others to test
        // early stop if too far
        if (d < .001 || t > 100.0) {
            hitDisk = d < .001;
            finalP = p;
            break;
        }
    }
    var value = (t * sliderA * f32(i) * params.sliderC); // sliderC .005)

    let photonSphereRadius = 3.0 * params.mass;
    let r = length(finalP); // distance from black hole center
    let nearPhotonSphere = abs(r - photonSphereRadius) < params.threshold;//10.1;//0.02; // tweak threshold

    if (nearPhotonSphere) {
        value += 0.2; // subtle glow boost
    }

    var diskUV = vec2f();
    if (hitDisk) {
        // Rotate the disk position around Y-axis to simulate spinning
        let angle = params.time * 1;//params.diskRotationSpeed; // e.g., diskRotationSpeed = 1.0
        let rotatedXZ = vec2f(finalP.x, finalP.z) * rot2d(angle);
        let rotatedP = vec3f(rotatedXZ.x, finalP.y, rotatedXZ.y);

        // Compute tangential velocity at rotated position
        let v = normalize(vec3f(-rotatedP.z, 0.0, rotatedP.x)); // velocity direction
        let toObserver = normalize(ro - finalP); // observer direction stays the same

        let beta = clamp(params.diskSpeed + params.spin * .5, 0.0, 0.99); // velocity fraction of light
        let gamma = clamp(1.0 / sqrt(1.0 - beta * beta), 1.0, 10.0);
        let cosTheta = dot(v, toObserver);
        let dopplerFactor = 1.0 / (gamma * (1.0 - beta * cosTheta));
        let dopplerBoost = clamp(dopplerFactor * 2.0, 0.5, 4.0);

        value *= dopplerBoost;
        value += dopplerBoost * params.hueShift;//0.3; // optional hue shift

        //----------------
        let diskPos = finalP; // point where ray hit the disk
        let radial = length(vec2f(diskPos.x, diskPos.z));
        let rotationSpeed = 2.;
        let angle2 = atan2(diskPos.z, diskPos.x) + params.time * params.diskSpeed;

        // Normalize to [0,1]
        let u = (angle2 + PI) / (2.0 * PI);
        let v2 = (radial - params.innerRadius) / (params.outerRadius - params.innerRadius);
        diskUV = vec2f(u * 4.3019 * .125, v2 * .265); // scaled to squash the clouds
    }



    value = clamp(value, 0.0, 1.0);
    col = paletteLerp(colors, value);

    var diskColor = texture(diskTexture, imageSampler, diskUV, false);
    diskColor = paletteLerp(colors, diskColor.r);
    if(hitDisk){
        // col = diskColor;
        col = mix(paletteLerp(colors, value), diskColor, 1-diskColor.g);
    }

    if (fellIntoBlackHole) {
        col = vec4f(); // pure black
    }

    let dir = normalize(rd);

    let uv3 = vec2f(
        0.5 + atan2(dir.x, dir.z) / (2.0 * PI),
        0.5 - asin(clamp(dir.y, -1.0, 1.0)) / PI
    );
    let imageColor = texture(image, imageSampler, uv3 * 3, false);
    if (!hitDisk && !fellIntoBlackHole) {
        col = mix(col, imageColor, 1.0);
    }
    // col = abs(rd);

    return col;
}
`;

export default frag;
