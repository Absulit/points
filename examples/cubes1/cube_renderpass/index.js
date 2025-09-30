import { RenderPass } from 'points';
import vert from './vert.js';
import frag from './frag.js';
import compute from './compute.js';

export const cube_renderpass = new RenderPass(vert, frag, compute);
