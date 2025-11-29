import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    var point = texture(computeTexture, imageSampler, in.uv / params.scale, true); //* .998046;

    return point;
}
`;

export default frag;
