import defaultStructs from '../defaultStructs.js';
import { clearMix, polar, rand } from '../defaultFunctions.js';

const planets2Compute = /*wgsl*/`

${defaultStructs}

struct Variable{
    particlesCreated: f32
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
        let particle  = &planets[k];
        //var particlePointer = (*particle);


        var rads = radians((*particle).angle);
        var pointFromCenter = polar(  (*particle).radius, rads);
        let x = f32(pointFromCenter.x);
        let y = f32(pointFromCenter.y);
        let ux = u32(x);
        let uy = u32(y);

        if((*particle).angle > 360){
            (*particle).angle = 0.;
        }
        (*particle).angle += ((*particle).speed * .1);
        (*particle).x = x;
        (*particle).y = y;
    }
}
`;

export default planets2Compute;

