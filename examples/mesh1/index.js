import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
const mesh1 = {
    vert,
    compute,
    frag,
    init: async (points) => {
        points.setMeshDensity(20,20);
    },
    update: (points) => {

    }
}

export default mesh1;