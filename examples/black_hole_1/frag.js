import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${fnusin}


@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let center = params.screen*.5;
    // let uv = pos.xy;
    let r = distance(position.xy, center);

    let M = params.mass;
    let diskRadius = params.radius;

    // Impact parameter approximation
    let b = r / sqrt(1.0 - (2.0 * M) / r);

    // Normalize b to [0, 1]
    let bNorm = clamp(b / diskRadius, 0.0, 1.0);

    // Doppler brightening (simulate rotation)
    let angle = atan2(position.y - center.y, position.x - center.x);
    let brightness = 0.6 + 0.4 * cos(angle);

    // Color gradient from white to orange to black
    var finalColor = mix(vec3f(1.0, 1.0, 1.0), vec3f(1.0, 0.5, 0.0), bNorm);
    finalColor = mix(finalColor, vec3f(0.0, 0.0, 0.0), bNorm * bNorm);

    return vec4f(finalColor * brightness, 1.0);
}
`;

export default frag;
