import { RGBAFromHSV } from '../../src/core/color.js';
import { fnusin } from '../../src/core/defaultFunctions.js';
import { rand, random } from '../../src/core/random.js';

const compute = /*wgsl*/`

${random}
${rand}
${RGBAFromHSV}
${fnusin}

const workgroupSize = 8;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {

    let numColumns:f32 = params.screenWidth;
    let numRows:f32 = params.screenHeight;

    let numColumnsPiece:i32 = i32(numColumns / f32(workgroupSize));
    let numRowsPiece:i32 = i32(numRows / f32(workgroupSize));

    for (var indexColumns:i32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
        let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
        let ux = u32(x);
        let ix = i32(x);
        let nx = x / numColumns;
        for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

            let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
            let uy = u32(y);
            let iy = i32(y);
            let ny = y / numRows;

            rand_seed.x += f32(WorkGroupID.x);
            rand_seed.y += f32(WorkGroupID.y);

            seed += i32(WorkGroupID.x + WorkGroupID.y);

            let randNumber = rand();
            rand_seed.y += randNumber + fract(params.sliderA);
            var v = 0.;
            if(randNumber < .5){
                v = 1.;
            }

            // textureStore(outputTex, vec2<u32>(ux,uy), vec4(randNumber));
            // textureStore(outputTex, vec2<u32>(ux,uy), RGBAFromHSV(randNumber, 1, 1));
            // textureStore(outputTex, vec2<u32>(ux,uy), RGBAFromHSV( fnusin(randNumber), 1, 1));
            // textureStore(outputTex, vec2<u32>(ux,uy), vec4( fnusin(randNumber)));
            textureStore(outputTex, vec2<u32>(ux,uy), vec4( fract(randNumber + fnusin(1))));
        }
    }
}
`;

export default compute;
