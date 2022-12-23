import { rand, RGBAFromHSV } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';
import { random } from '../random.js';

const random3Compute = /*wgsl*/`

${defaultStructs}
${random}
${rand}
${RGBAFromHSV}


struct Star{
    a: f32,
    b: f32,
    c: f32,
    d: f32,
}
const workgroupSize = 8;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let utime = params.utime;

    // let dims: vec2<u32> = textureDimensions(feedbackTexture, 0);
    _ = textureSampleLevel(feedbackTexture, feedbackSampler, vec2(0),  0.0).rgba;

    //let star = stars[0];

    //----------------------------
    //let dims: vec2<u32> = textureDimensions(feedbackTexture, 0);

    let numColumns:f32 = params.screenWidth;
    let numRows:f32 = params.screenHeight;
    //let constant = u32(numColumns) / 93u;

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
            rand_seed.y += randNumber + fract(utime);
            var v = 0.;
            if(randNumber < .5){
                v = 1.;
            }

            //textureStore(outputTex, vec2<u32>(ux,uy), vec4(randNumber));
            textureStore(outputTex, vec2<u32>(ux,uy), RGBAFromHSV(randNumber, 1, 1));
        }
    }

    // let numPixels = i32(numColumns * numRows);
    // for (var index:i32 = 0; index < numPixels; index++){
    //     let x = u32(f32(index) % numColumns);
    //     let y = u32(f32(index) / numRows);
    //     let randNumber = rand();
    //     textureStore(outputTex, vec2<u32>(x,y), vec4(randNumber));
    // }


}
`;

export default random3Compute;
