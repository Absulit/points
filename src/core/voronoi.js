/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/voronoi
 */

import { rand } from './random.js';

// Created by Sebastián Sanabria Díaz absulit.com

/**
 * Voronoi noise
 * @type {String}
 * @param {vec2f} p origin point
 * @param {u32} numPoints number of cells
 * @return `vec2f`
 */
export const voronoi = /*wgsl*/`

${rand}

fn voronoi(p:vec2f, numPoints:u32) -> vec2f {
    var lastDistance = -1.;
    var c = 1.;
    for(var i:u32 = 0; i < numPoints; i++){
        rand();
        var d = distance(p, rand_seed);

        if(lastDistance != -1.){
            lastDistance = min(lastDistance, d);
        }else{
            lastDistance = d;
        }
    }
    if(lastDistance > .01){
        c = 0.;
    }

    return vec2f(1-lastDistance, c);
}
`;
