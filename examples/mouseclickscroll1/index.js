import vert from './vert.js';
import frag from './frag.js';

const mouseclickscroll1 = {
    vert,
    frag,
    init: async points => {
        points.addStorage('variables', 1, 'Variable', 4);
    },
    update: points => {

    }
}

export default mouseclickscroll1;
