const frag = /*wgsl*/`

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    // stretched uv if canvas dimensions are non squared
    let uvColor:vec4f = vec4( fract(uv * 10), 0,1);

    // always square dimensions
    let uvrColor:vec4f = vec4( fract(uvr * 20), 0,1).rbga;

    var factor = 0.;
    if(uv.x > mouse.x){
        factor = 1.;
    }

    return mix(uvColor, uvrColor, factor);
}
`;

export default frag;
