import vert from './vert.js';
import frag from './frag.js';

const mouseclickscroll1 = {
    vert,
    frag,
    init: async points => {
        points.addStorage('variables', 'Variable');
    },
    update: points => {

    }
}

export default mouseclickscroll1;
