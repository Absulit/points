const frag = /*wgsl*/`


@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let audioX = audio.data[u32(uvr.x * params.audioLength)] / 256;

    if(params.mouseClick == 1.){
        click_event.updated = 1;
        // other actions
    }


    var c = vec4f();
    c.r = audioX;
    c.a = 1.;

    return c;
}
`;

export default frag;
