import { RenderPass } from 'points';
import vert from './vert.js';
import frag from './frag.js';

export const cube_renderpass = new RenderPass(vert, frag);
