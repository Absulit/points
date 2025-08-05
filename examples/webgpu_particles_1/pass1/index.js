import vert from './vert.js';
import frag from './frag.js';
import compute from './compute.js';

import { RenderPass } from 'points';

export default new RenderPass(null, null, compute);
