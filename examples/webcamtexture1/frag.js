import { texture, textureExternal } from 'points/image';

const frag = /*wgsl*/`

${textureExternal}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    var flip = vec2f(1, 1);
    var displace = vec2f();
    if(params.flip == 1){
        flip = vec2f(-1, 1);
        displace = vec2f(1, 0);
    }

    var ratioScale = 1.;
    if(params.isMobile == 1){
        ratioScale = in.ratio.x;
    }

    return textureExternal(webcam, imageSampler, in.uvr / ratioScale * flip + displace, true);
}
`;

export default frag;
