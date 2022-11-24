import defaultStructs from './defaultStructs.js';
import { clearMix, polar, rand } from './defaultFunctions.js';

const planetsCompute = /*wgsl*/`

${defaultStructs}

${rand}
${clearMix}
${polar}

struct Variables{
    particlesCreated: f32,
    testValue: f32
}

struct Planet{
    radius: f32,
    speed: f32,
    angle: f32,
    x: f32,
    y: f32
}


var<private> numParticles:u32 = 8;


const workgroupSize = 8;

//'function', 'private', 'push_constant', 'storage', 'uniform', 'workgroup'
@group(0) @binding(0) var <storage, read_write> layer0: Points;
@group(0) @binding(1) var feedbackSampler: sampler;
@group(0) @binding(2) var feedbackTexture: texture_2d<f32>;
@group(0) @binding(3) var outputTex : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(4) var <storage, read_write> variables: Variables;
//@group(0) @binding(5) var <storage, read_write> particles: Particles;
@group(0) @binding(6) var <storage, read_write> particles2: array<Planet>;


@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    var l0 = layer0.points[0];
    let utime = params.utime;
    //let chemical = particles.chemicals[0];
    let planet2 = particles2[0];
    let tv: ptr<storage, f32, read_write> = &variables.testValue;

    let pc: ptr<storage, f32, read_write> = &variables.particlesCreated;

    if((*pc) == 0){
        planets[0] = Planet(5, 10, rand() * 360, 0, 0 );
        planets[1] = Planet(10, 7, rand() * 360, 0, 0 );
        planets[2] = Planet(13, 6, rand() * 360, 0, 0 );
        planets[3] = Planet(16, 5, rand() * 360, 0, 0 );
        planets[4] = Planet(20, 5, rand() * 360, 0, 0 );
        planets[5] = Planet(23, 1, rand() * 360, 0, 0 );
        planets[6] = Planet(27, -1, rand() * 360, 0, 0 );
        planets[7] = Planet(32, .1, rand() * 360, 0, 0 );
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
        let planet  = &planets[k];
        //var planetPointer = (*planet);


        var rads = radians((*planet).angle);
        var pointFromCenter = polar(  (*planet).radius, rads);
        let x = f32(pointFromCenter.x); //+ variables.testValue;
        let y = f32(pointFromCenter.y);
        let ux = u32(x);
        let uy = u32(y);

        variables.testValue += .1;

        if((*planet).angle > 360){
            (*planet).angle = 0.;
        }
        (*planet).angle += ((*planet).speed * .1);
        (*planet).x = x;
        (*planet).y = y;

        //var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(x, y),  0.0).rgba;

        //textureStore(outputTex, vec2<u32>(ux,uy), vec4<f32>(1,1,1,1));
    }


}`;

export default planetsCompute;

