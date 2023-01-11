import defaultStructs from '../defaultStructs.js';
import { clearMix, polar } from '../defaultFunctions.js';
import { rand } from '../random.js';

const compute = /*wgsl*/`

${defaultStructs}

${rand}
${clearMix}
${polar}

struct Variable{
    particlesCreated: f32,
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

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let utime = params.utime;

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

        if((*planet).angle > 360){
            (*planet).angle = 0.;
        }
        (*planet).angle += ((*planet).speed * .1);
        (*planet).x = x;
        (*planet).y = y;

    }


}`;

export default compute;

