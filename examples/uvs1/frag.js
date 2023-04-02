const frag = /*wgsl*/`

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    // stretched uv if canvas dimensions are non squared
    let uvColor:vec4<f32> = vec4( fract(uv * 10), 0,1);

    // always square dimensions
    let uvrColor:vec4<f32> = vec4( fract(uvr * 20), 0,1).rbga;

    var factor = 0.;
    if(uv.x > mouse.x){
        factor = 1.;
    }

    return mix(uvColor, uvrColor, factor);
}
`;

export default frag;
