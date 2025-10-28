import { texture, textureExternal } from 'points/image';

const frag = /*wgsl*/`

${textureExternal}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    var flip = vec2f(1, 1);
    var displace = vec2f();
    if(params.flip == 1){
        flip = vec2f(-1, 1);
        displace = vec2f(1, 0);
    }

    var ratioScale = 1.;
    if(params.isMobile == 1){
        ratioScale = ratio.x;
    }

    return textureExternal(webcam, imageSampler, uvr / ratioScale * flip + displace, true);
}
`;

export default frag;
