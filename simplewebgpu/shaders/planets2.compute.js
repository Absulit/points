import defaultStructs from './defaultStructs.js';
import { clearMix, polar, rand } from './defaultFunctions.js';

const planets2Compute = /*wgsl*/`

${defaultStructs}

struct Variables{
    particlesCreated: f32,
    testValue: f32
}

${rand}
${clearMix}
${polar}

//'function', 'private', 'push_constant', 'storage', 'uniform', 'workgroup'
@group(0) @binding(0) var <storage, read_write> layer0: Points;
@group(0) @binding(1) var feedbackSampler: sampler;
@group(0) @binding(2) var feedbackTexture: texture_2d<f32>;
@group(0) @binding(3) var outputTex : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(4) var <storage, read_write> variables: Variables;
@group(0) @binding(5) var <storage, read_write> particles: Particles;
@group(0) @binding(6) var <uniform> params: Params;
@group(0) @binding(7) var <storage, read_write> particles2: Particles;

struct Planet{
    radius: f32,
    speed: f32,
    angle: f32,
    x: f32,
    y: f32
}

struct Particles{
    planets: array<Planet>
}

var<private> numParticles:u32 = 8;
const workgroupSize = 8;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    var l0 = layer0.points[0];
    let utime = params.utime;
    let planet2 = particles2.planets[0];

    let pc: ptr<storage, f32, read_write> = &variables.particlesCreated;

    if((*pc) == 0){
        particles.planets[0] = Planet(5, 10, rand() * 360, 0, 0 );
        particles.planets[1] = Planet(10, 7, rand() * 360, 0, 0 );
        particles.planets[2] = Planet(13, 6, rand() * 360, 0, 0 );
        particles.planets[3] = Planet(16, 5, rand() * 360, 0, 0 );
        particles.planets[4] = Planet(20, 5, rand() * 360, 0, 0 );
        particles.planets[5] = Planet(23, 1, rand() * 360, 0, 0 );
        particles.planets[6] = Planet(27, -1, rand() * 360, 0, 0 );
        particles.planets[7] = Planet(32, .1, rand() * 360, 0, 0 );
        (*pc) = 1;
    }


    let dims : vec2<u32> = textureDimensions(feedbackTexture, 0);
    let rgb = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(0) ,0.0).rgb;
    textureStore(outputTex, vec2<u32>(0,0), vec4<f32>(1,1,1,1));

    //--------------------------------------------------------------


    //workgroupBarrier();

    let numIndexPiece:u32 = numParticles / workgroupSize * workgroupSize;

    for(var indexPiece:u32; indexPiece<numIndexPiece; indexPiece++){
        let k:u32 = WorkGroupID.x * WorkGroupID.y * numParticles + indexPiece;
        let particle  = &particles.planets[k];
        //var particlePointer = (*particle);


        var rads = radians((*particle).angle);
        var pointFromCenter = polar(  (*particle).radius, rads);
        let x = f32(pointFromCenter.x); //+ variables.testValue;
        let y = f32(pointFromCenter.y);
        let ux = u32(x);
        let uy = u32(y);

        variables.testValue += .1;

        if((*particle).angle > 360){
            (*particle).angle = 0.;
        }
        (*particle).angle += ((*particle).speed * .1);
        (*particle).x = x;
        (*particle).y = y;

        //var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(x, y),  0.0).rgba;

        //textureStore(outputTex, vec2<u32>(ux,uy), vec4<f32>(1,1,1,1));
    }
}
`;

export default planets2Compute;

