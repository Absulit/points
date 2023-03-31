import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from '../../src/absulit.points.module.js';

const mouseclickscroll1 = {
    vert,
    compute,
    frag,
    init: async points => {
        points.addStorage('variables', 1, 'Variable', 4);
    },
    update: points => {

    }
}

export default mouseclickscroll1;
