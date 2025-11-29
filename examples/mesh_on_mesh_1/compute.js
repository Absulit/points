import { structs } from './structs.js';

const compute = /*wgsl*/`

${structs}

@compute @workgroup_size(THREADS_X,THREADS_Y,THREADS_Z)
fn main(in: ComputeIn) {
}
`;

export default compute;
