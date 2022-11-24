import { clearAlpha, clearMix, fnusin, fusin, getColorsAround, polar, rand, soften8 } from './defaultFunctions.js';
import defaultStructs from './defaultStructs.js';
import { PI } from './defaultConstants.js';

const reactiondiffusionCompute = /*wgsl*/`

${defaultStructs}

struct Variables{
    particlesCreated: f32,
    testValue: f32,
    squaresCreated: f32
}

struct Chemical{
    a: f32,
    b: f32
}


${rand}
${clearMix}
${clearAlpha}
${polar}
${getColorsAround}
${soften8}
${fnusin}
${fusin}


fn getPointsAround(position: vec2<i32>, distance: i32) -> array<  Chemical, 8  >{
    let index0 = (position.x-distance) + ( (position.y-distance) * 800);
    let index1 = (position.x)           + ( (position.y-distance) * 800);
    let index2 = (position.x+distance) + ( (position.y-distance) * 800);
    let index3 = (position.x-distance) + ( (position.y) * 800);
    let index4 = (position.x+distance) + ( (position.y) * 800);
    let index5 = (position.x-distance) + ( (position.y+distance) * 800);
    let index6 = (position.x)           + ( (position.y+distance) * 800);
    let index7 = (position.x+distance) + ( (position.y+distance) * 800);
    return array< Chemical, 8 >(
        chemicals[index0],
        chemicals[index1],
        chemicals[index2],
        chemicals[index3],
        chemicals[index4],
        chemicals[index5],
        chemicals[index6],
        chemicals[index7]
    );
}

fn laplaceA(position:vec2<i32>, chemical:Chemical) -> f32{
    let pointsAround = getPointsAround(position, 1);
    //     if (pointsAround.includes(null)) {
    //         return 0;
    //     }
    let direct = .2;
    let diagonal = .05;
    var sum = 0.;

    sum += chemical.a * -1.;

    sum += pointsAround[1].a * direct;
    sum += pointsAround[3].a * direct;
    sum += pointsAround[4].a * direct;
    sum += pointsAround[6].a * direct;

    sum += pointsAround[0].a * diagonal;
    sum += pointsAround[2].a * diagonal;
    sum += pointsAround[5].a * diagonal;
    sum += pointsAround[7].a * diagonal;

    return sum;
}

fn laplaceB(position:vec2<i32>, chemical:Chemical) -> f32{
    let pointsAround = getPointsAround(position, 1);
    //     if (pointsAround.includes(null)) {
    //         return 0;
    //     }
    let direct = .2;
    let diagonal = .05;
    var sum = 0.;

    sum += chemical.b * -1.;

    sum += pointsAround[1].b * direct;
    sum += pointsAround[3].b * direct;
    sum += pointsAround[4].b * direct;
    sum += pointsAround[6].b * direct;

    sum += pointsAround[0].b * diagonal;
    sum += pointsAround[2].b * diagonal;
    sum += pointsAround[5].b * diagonal;
    sum += pointsAround[7].b * diagonal;

    return sum;
}

var<private> numParticles:u32 = 800*800;

${PI}
const workgroupSize = 8;
const SQUARESIDE = 400;

// .1,.5,.055,.062 // original
// .1,.5,.022,.050 // scary
// .1,.6,.011,.040
// .95,.6,.011,.040
// .98,.8,.011,.040 // wavy brainy
// .98,.9,.014,.046 // fungi
// .98,.9,.013,.046 // fungi
// .98,.9,.012,.045 // fungi
// .98,.9,.012,.044 // fungi

const DA = 1.; //1.
const DB = .5; //.5
const FEED = .055; // .055
const K = .062; //.062

//'function', 'private', 'push_constant', 'storage', 'uniform', 'workgroup'
@group(0) @binding(0) var<storage, read_write> layer0: Points;
@group(0) @binding(1) var feedbackSampler: sampler;
@group(0) @binding(2) var feedbackTexture: texture_2d<f32>;
@group(0) @binding(3) var outputTex : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(4) var <storage, read_write> variables: Variables;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    var l0 = layer0.points[0];
    let utime = params.utime;
    let chemical = chemicals[0];
    let chemical2 = chemicals2[0];

    let sc: ptr<storage, f32, read_write> = &variables.squaresCreated;

    if((*sc) == 0){

        for(var k:u32; k<numParticles;k++){
            chemicals[k] = Chemical(1, 0);
            chemicals2[k] = Chemical(1, 0);
        }

        let centerIndex:u32 = u32((400 - SQUARESIDE*.5) +( (400 - SQUARESIDE*.5)*800));

        for (var i:u32 = 0; i < SQUARESIDE; i++) {
            for (var j:u32 = 0; j < SQUARESIDE; j++) {
                //index = i+(j*800)
                let chemical = &chemicals[centerIndex + i+(j*800)];
                (*chemical).b = 1;
            }
        }

        // for (var i:u32 = 0; i < SQUARESIDE; i++) {
        //     for (var j:u32 = 0; j < SQUARESIDE; j++) {
        //         // const point = screen.getPointAt(i + this._screen.center.x - squareSide * 1.3, j + this._screen.center.y - squareSide * 1.1);
        //         // point.chemicals.b = 1;
        //     }
        // }



        (*sc) = 1;
    }




    //let dims : vec2<u32> = textureDimensions(feedbackTexture, 0);
    var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2(0),  0.0).rgba;
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
        let ix = i32(x);
        let nx = x / numColumns;
        for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

            let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
            let uy = u32(y);
            let iy = i32(y);
            let ny = y / numRows;

            //let index:f32 = y + (x * screenSize.numColumns);
            var rgba = textureLoad(feedbackTexture, vec2<i32>(ix,iy), 0).rgba;


            //--------------------------------------------------------------
            let chemicalBelow = &chemicals[ux+(uy*800)];
            let chemicalAbove = &chemicals2[ux+(uy*800)];

            let chemicalAboveClone = chemicals2[ux+(uy*800)];

            (*chemicalAbove).a = (*chemicalBelow).a;
            (*chemicalAbove).b = (*chemicalBelow).b;

            (*chemicalBelow).a = chemicalAboveClone.a;
            (*chemicalBelow).b = chemicalAboveClone.b;

            //--------------------------------------------------------------

            let a = chemicalAboveClone.a ;
            let b = chemicalAboveClone.b ;
            let position = vec2<i32>(ix, iy);
            (*chemicalBelow).a = a + (DA * laplaceA(position, (*chemicalBelow))) - (a*b*b) + (FEED * (1-a));
            (*chemicalBelow).b = b + (DB * laplaceB(position, (*chemicalBelow))) + (a*b*b) - ((K + FEED) * b);

            (*chemicalBelow).a = clamp( (*chemicalBelow).a, 0, 1 );
            (*chemicalBelow).b = clamp( (*chemicalBelow).b, 0, 1 );

            let c = clamp( (*chemicalBelow).a - (*chemicalBelow).b, 0, 1 );


            //let colorsAround = getColorsAround(vec2<i32>(ix,iy), 1);
            //rgba = soften8(rgba, colorsAround, 1.);


            textureStore(outputTex, vec2<u32>(ux,uy), vec4<f32>(c));

        }


    }




    

    //workgroupBarrier();

}
`;

export default reactiondiffusionCompute;
