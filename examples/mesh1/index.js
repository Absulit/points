import vert from './vert.js';
import frag from './frag.js';
const mesh1 = {
    vert,
    frag,
    init: async points => {
        points.setMeshDensity(20,20);
    },
    update: points => {

    }
}

export default mesh1;