import { RenderPass } from 'points';
import vert from './vert.js';
import frag from './frag.js';

export const staticcube_renderpass = new RenderPass(vert, frag);
