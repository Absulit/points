import { rand } from './random.js';

export const voronoi = /*wgsl*/`

${rand}

fn voronoi(p:vec2<f32>, numPoints:u32) -> vec2<f32> {
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

    return vec2<f32>(1-lastDistance, c);
}
`;
