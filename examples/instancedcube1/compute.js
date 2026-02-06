const compute = /*wgsl*/`

@compute @workgroup_size(THREADS_X, THREADS_Y, THREADS_Z)
fn main(in: ComputeIn) {
    let GlobalId = in.GID;
    let width = SIDE;
    let height = SIDE;
    let index = in.GID.x + (in.GID.y * width) + (in.GID.z * width * height);
    let particle = &particles[index];

    if(particle.init == 0){
        let gidCentered = vec3f(vec3i(GlobalId) - HALFSIDE);
        particle.position = vec3( gidCentered.x * UNIT,  gidCentered.y * UNIT, gidCentered.z * UNIT);
        particle.color = vec4f(1);
        particle.init = 1;
    }
}
`;

export default compute;
