import { fnusin } from 'points/animation';
import { RGBAFromHSV } from 'points/color';
import { rand, random } from 'points/random';

const compute = /*wgsl*/`

${random}
${rand}
${RGBAFromHSV}
${fnusin}

const workgroupSize = 1;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(in: ComputeIn) {

    rand_seed.x += f32(in.WID.x);
    rand_seed.y += f32(in.WID.y);

    seed += i32(in.WID.x + in.WID.y);

    let randNumber = rand();
    rand_seed.y += randNumber + fract(params.sliderA);
    let v = step(randNumber, .5); // if(randNumber < .5){v = 1.;}

    // textureStore(outputTex, in.GID.xy, vec4(randNumber));
    // textureStore(outputTex, in.GID.xy, RGBAFromHSV(randNumber, 1, 1));
    // textureStore(outputTex, in.GID.xy, RGBAFromHSV( fnusin(randNumber), 1, 1));
    // textureStore(outputTex, in.GID.xy, vec4( fnusin(randNumber)));

    textureStore(outputTex, in.GID.xy, vec4(fract(randNumber + fnusin(1))));
    // textureStore(outputTex, in.WID.xy, vec4( fract(randNumber + fnusin(1))));
    // textureStore(outputTex, LocalInvocationID.xy, vec4( fract(randNumber + fnusin(1))));

}
`;

export default compute;
