import defaultStructs from '../../src/shaders/defaultStructs.js';

const frag = /*wgsl*/`

${defaultStructs}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let r = vec2<f32>(params.screenWidth, params.screenHeight);

    var p = (position.xy * 2. - r) / min(r.x, r.y) - mouse;
    for(var i = 0; i < 8; i++){
        p = abs(p) / abs(dot(p, p)) - vec2(.9 + cos(params.utime * .2) * .4);
    }

    let finalColor = vec4(p.xxy, 1);

    return finalColor;
}
`;

export default frag;
