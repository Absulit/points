const frag = /*wgsl*/`

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    // stretched uv if canvas dimensions are non squared
    let uvColor = vec4(fract(uv * 10), 0, 1);

    // always square dimensions
    let uvrColor = vec4(fract(in.uvr * 20), 0, 1).rbga;

    // if(uv.x > mouse.x){factor = 1.;}
    let factor = step(uv.x, mouse.x);

    return mix(uvColor, uvrColor, factor);
}
`;

export default frag;
