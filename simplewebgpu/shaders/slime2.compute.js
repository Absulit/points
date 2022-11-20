import { PI } from './defaultConstants.js';
import { clearMix, getColorsAround, polar, rand, soften8 } from './defaultFunctions.js';
import defaultStructs from './defaultStructs.js';

const slime2Compute = /*wgsl*/`

${defaultStructs}

struct Variables{
    particlesCreated: f32,
    testValue: f32
}

struct Particle{
    position: vec2<f32>,
    angle: f32,
    distance: f32
}

struct Particles{
    items: array<Particle>
}

${rand}
${clearMix}
${polar}
${getColorsAround}
${soften8}

fn sense(particle:Particle, sensorAngleOffset:f32){
    let sensorAngle = particle.angle + sensorAngleOffset;
    let sensorDir = vec2<f32>(cos(sensorAngle),sin(sensorAngle));
    let sensorCenter = particle.position + sensorDir * sensorAngleOffset;
    let sum = 0.;
}

var<private> numParticles:u32 = 500;
${PI}
const workgroupSize = 8;
const MARGIN = 20;

//'function', 'private', 'push_constant', 'storage', 'uniform', 'workgroup'
@group(0) @binding(0) var <storage, read_write> layer0: Points;
@group(0) @binding(1) var feedbackSampler: sampler;
@group(0) @binding(2) var feedbackTexture: texture_2d<f32>;
@group(0) @binding(3) var outputTex : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(4) var <storage, read_write> variables: Variables;
@group(0) @binding(5) var <storage, read_write> particles: Particles;
@group(0) @binding(6) var <uniform> params: Params;
@group(0) @binding(7) var <storage, read_write> particles2: Particles;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    var l0 = layer0.points[0];
    let item2 = particles2.items[0];
    let pc: ptr<storage, f32, read_write> = &variables.particlesCreated;

    if((*pc) == 0){
        for(var k:u32; k<numParticles; k++){
            particles.items[k] = Particle( vec2<f32>(400., 400.), rand() * PI * 2, 1. );
        }

        (*pc) = 1;
    }

    //let dims : vec2<u32> = textureDimensions(feedbackTexture, 0);
    //let rgb = textureSampleLevel(feedbackTexture, feedbackSampler, (vec2<f32>(0) + vec2<f32>(0.25, 0.25)) / vec2<f32>(dims),0.0).rgb;
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
            var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(x,y),  0.0).rgba;

            let colorsAround = getColorsAround(vec2<i32>(ix,iy), 1);
            rgba = soften8(rgba, colorsAround, 1.);

            rgba = vec4<f32>(1,0,0,1);
            rgba = clearMix(rgba, 1.01);


            textureStore(outputTex, vec2<i32>(ix,iy), rgba * .01);
        }
    }

    let moveSpeed = .01;
    //workgroupBarrier();

    let numIndexPiece:u32 = numParticles / workgroupSize * workgroupSize;

    for(var indexPiece:u32; indexPiece<numIndexPiece; indexPiece++){
        let k:u32 = WorkGroupID.x * WorkGroupID.y * numParticles + indexPiece;
        let particle  = &particles.items[k];

        let direction = vec2<f32>(cos( (*particle).angle ), sin( (*particle).angle ));
        var newPos = (*particle).position + direction * moveSpeed * params.utime;


        // Clamp position to map boundaries, and pick new random move angle if hits boundaries
        if(newPos.x < 0 || newPos.x >= params.screenWidth || newPos.y < 0 || newPos.y >= params.screenHeight){
            newPos.x = min(params.screenWidth-.01, max(0, newPos.x));
            newPos.y = min(params.screenHeight-.01, max(0, newPos.y));
            (*particle).angle = rand() * 2 * PI;
        }

        (*particle).position = newPos;


        //

        var uxy = vec2<u32>( (*particle).position );
        var xy = (*particle).position;
        var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, xy,  0.0).rgba;


        //xy = vec2<u32>(0,0);
        textureStore(outputTex, uxy, vec4<f32>(1,1,1,1) );

    }

}
`;

export default slime2Compute;