import { sdfCircle } from 'points/sdf';

const frag = /*wgsl*/`

${sdfCircle}



@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let c0 = sdfCircle(vec2f(.5)*ratio, .1, 0, uvr);

    return vec4(c0);
}
`;

export default frag;
