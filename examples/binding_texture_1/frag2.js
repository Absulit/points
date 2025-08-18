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

    let finalColor = vec4f(.2,.1,.5, 1);

    return finalColor;
}
`;

export default frag;
