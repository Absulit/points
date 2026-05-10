import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${fnusin}


/**
 * VertexIn
 * position: vec4f,
 * color: vec4f,
 * uv: vec2f,
 * ratio: vec2f,  // relation between params.screen.x and params.screen.y
 * uvr: vec2f,    // uv with aspect ratio corrected
 * mouse: vec2f,
 * normal: vec3f,
 * id: u32,       // mesh or instance id
 * barycentrics: vec3f,
 */
@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {
    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(in.uvr.x  * cellSize) * sin(in.uvr.y * cellSize);
    let b = sin(in.uvr.x * in.uvr.y * 10. * 9.1 * .25 );
    let c = fnusin(in.uvr.x * in.uvr.y * 10.);
    let d = distance(a,b);
    let f = d * in.uvr.x * in.uvr.y;
    let finalColor:vec4f = vec4(a*d,f*c*a,f, 1.);

    return finalColor;
}
`;

export default frag;
