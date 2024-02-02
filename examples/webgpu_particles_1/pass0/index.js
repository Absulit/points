import vert from './vert.js';
import frag from './frag.js';
import compute from './compute.js';

import RenderPass from 'renderpass';

export default new RenderPass(vert, frag, compute);
