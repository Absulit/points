import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}

fn rotateAroundCenter(pos: vec2f, center: vec2f, angle: f32) -> vec2f {
  let offset = pos - center;
  let s = sin(angle);
  let c = cos(angle);
  let rotated = vec2f(
    offset.x * c - offset.y * s,
    offset.x * s + offset.y * c
  );
  return center + rotated;
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


    let center = mouse * ratio;
    // let center = params.screen*.5;;
    let r = length(uvr - center);

    let innerRadius = 0.05; // Closest stable orbit
    let outerRadius = 0.2;  // Disk fade-out limit

    let diskMask = step(innerRadius, r) * step(r, outerRadius);

    let angularSpeed = 5.0; // Controls how fast the disk spins
    let angle = params.time * angularSpeed / r; // Faster near center
    let rotatedUV = rotateAroundCenter(uvr, center, angle);

    let diskColor = vec3f(1.0, 0.6, 0.2); // Orange glow
    let intensity = smoothstep(innerRadius, outerRadius, r);
    let finalDisk = vec4f(diskColor * intensity, 1.0) * diskMask;


    // Simulate gravitational lensing: bend UVs toward black hole
    let strength = params.mass / (r * r); // Inverse-square falloff
    let bendDir = normalize(center - uvr);
    let distortedPos = uvr + bendDir * strength * .0001; // Scale factor

    // Convert back to UV space
    let distortedUV = distortedPos / params.screen;

    // Sample background texture
    var c = texture(image, imageSampler, distortedPos, false);

    // Avoid singularity
    if (r < params.radius) {
        c = vec4f(0); // Black hole core
    }

    let finalColor = mix(c, finalDisk, diskMask);

    return finalColor;
}
`;

export default frag;
