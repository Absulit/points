import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${fnusin}


@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(in.uv.x  * cellSize) * sin(in.uv.y * cellSize);
    let b = sin(in.uv.x * in.uv.y * 10. * 9.1 * .25 );
    let c = fnusin(in.uv.x * in.uv.y * 10.);
    let d = distance(a,b);
    let f = d * in.uv.x * in.uv.y;
    let finalColor:vec4f = vec4(a*d,f*c*a,f, 1.);

    return finalColor;
}
`;

export default frag;
