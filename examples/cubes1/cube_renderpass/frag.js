import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${fnusin}

@fragment
fn main(
    in: CustomFragment,
    @builtin(front_facing) isFront: bool,
) -> @location(0) vec4f {

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(in.uvr.x  * cellSize) * sin(in.uvr.y * cellSize);
    let b = sin(in.uvr.x * in.uvr.y * 10. * 9.1 * .25 );
    let c = fnusin(in.uvr.x * in.uvr.y * 10.);
    let d = distance(a,b);
    let f = d * in.uvr.x * in.uvr.y;
    let finalColor:vec4f = vec4(a*d-in.noise,f*c*a,f, 1.);

    let depth = clamp(in.depth.r * 8, 0, 1);
    return vec4f(finalColor.rgb * (1-depth), 1);
}
`;

export default frag;
