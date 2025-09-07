import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}


@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    // let uv = fragCoord.xy / uniforms.resolution;

    // Convert UV to screen space
    // let screenPos = uv * uniforms.resolution;
    // let toCenter = vec2f(400) - position;

    let center = vec2f(.5) * ratio;
    // let center = params.screen*.5;;
    let r = length(uvr - center);



    // Simulate gravitational lensing: bend UVs toward black hole
    let strength = params.mass / (r * r); // Inverse-square falloff
    let bendDir = normalize(center);
    let distortedPos = uvr - bendDir * strength * .001; // Scale factor

    // Convert back to UV space
    let distortedUV = distortedPos / uvr;

    // Sample background texture
    var c = texture(image, imageSampler, distortedUV, false);
    // Avoid singularity

    if (r < params.radius) {
        c = vec4f(0.0, 0.0, 0.0, 1.0); // Black hole core
    }

    return c;
}
`;

export default frag;
