import defaultStructs from '../defaultStructs.js';
import { clearMix, polar } from '../defaultFunctions.js';
import { rand } from '../random.js';

const planets3Compute = /*wgsl*/`

${defaultStructs}

struct Planet{
    radius: f32,
    speed: f32,
    angle: f32
}

struct Variable{
    pc: f32
}

const workgroupSize = 8;

${rand}
${clearMix}
${polar}


//'function', 'private', 'push_constant', 'storage', 'uniform', 'workgroup'

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let numParticles = u32(params.numParticles);
    let pc = &variables.pc;

    if((*pc) == 0){
        for(var k:u32; k<numParticles; k++){
            planets[k] = Planet(rand() * 32, rand() * 10, rand() * 360 );
        }

        (*pc) = 1;
    }

    //--------------------------------------------------------------

    let dims: vec2<u32> = textureDimensions(feedbackTexture, 0);

    let numColumns:f32 = f32(dims.x);
    let numRows:f32 = f32(dims.y);
    //let constant = u32(numColumns) / 93u;

    let numColumnsPiece:i32 = i32(numColumns / f32(workgroupSize));
    let numRowsPiece:i32 = i32(numRows / f32(workgroupSize));

    for (var indexColumns:i32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
        let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
        let ux = u32(x);
        let nx = x / numColumns;
        for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

            let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
            let uy = u32(y);
            let ny = y / numRows;

            //let index:f32 = y + (x * screenSize.numColumns);
            var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(x,y),  0.0).rgba;

            //rgba += vec4<f32>(1.,0.,0.,.5);
            //rgba = clearMix(rgba, 1.01);

            textureStore(outputTex, vec2<u32>(ux,uy), rgba);

        }


    }

    //workgroupBarrier();

    let numIndexPiece:u32 = numParticles / workgroupSize * workgroupSize;

    for(var indexPiece:u32; indexPiece<numIndexPiece; indexPiece++){
        let k:u32 = WorkGroupID.x * WorkGroupID.y * numParticles + indexPiece;
        let particle  = &planets[k];
        //var particlePointer = (*particle);


        var rads = radians((*particle).angle);
        var pointFromCenter = polar(  (*particle).radius, rads);
        let x = f32(pointFromCenter.x + 25) * 16;
        let y = f32(pointFromCenter.y + 25) * 16;
        let ux = u32(x);
        let uy = u32(y);

        if((*particle).angle > 360){
            (*particle).angle = 0.;
        }
        (*particle).angle += ((*particle).speed * .001);

        var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(x, y),  0.0).rgba;

        textureStore(outputTex, vec2<u32>(ux,uy), vec4<f32>(1,1,1,1));
    }


}
`;

export default planets3Compute;
