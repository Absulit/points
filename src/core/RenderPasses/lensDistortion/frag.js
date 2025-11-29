// https://www.geeks3d.com/20140213/glsl-shader-library-fish-eye-and-dome-and-barrel-distortion-post-processing-filters/

import { texture } from '../../image.js';
import { rotateVector, polar, PI } from '../../math.js';
import { WHITE } from '../../color.js';
import { snoise } from '../../noise2d.js';
const frag = /*wgsl*/`

${texture}
${rotateVector}
${snoise}
${PI}
${WHITE}
${polar}

fn angle(p1:vec2f, p2:vec2f) -> f32 {
    let d = p1 - p2;
    return abs(atan2(d.y, d.x)) / PI;
}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let imagePosition = vec2(0.0,0.0) * in.ratio;
    let center = vec2(.5,.5) * in.ratio;
    let d = distance(center, in.uvr); // sqrt(dot(d, d));

    //vector from center to current fragment
    let vectorToCenter = in.uvr - center;
    let sqrtDotCenter = sqrt(dot(center, center));

    //amount of effect
    let power =  2.0 * PI / (2.0 * sqrtDotCenter )  * (params.lensDistortion_amount - 0.5);
    //radius of 1:1 effect
    var bind = .0;
    if (power > 0.0){
        //stick to corners
        bind = sqrtDotCenter;
    } else {
        //stick to borders
        if (in.ratio.x < 1.0) {
            bind = center.x;
        } else {
            bind = center.y;
        };
    }

    //Weird formulas
    var nuv = in.uvr;
    if (power > 0.0){//fisheye
        nuv = center + normalize(vectorToCenter) * tan(d * power) * bind / tan( bind * power);
    } else if (power < 0.0){//antifisheye
        nuv = center + normalize(vectorToCenter) * atan(d * -power * 10.0) * bind / atan(-power * bind * 10.0);
    } else {
        nuv = in.uvr;
    }

    // let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, imagePosition, nuv, false);


    // Chromatic Aberration --
    // --------- chromatic displacement vector
    let cdv = vec2(params.lensDistortion_distance, 0.);
    // let dis = distance(vec2(.5,.5), in.uvr);
    let imageColorR = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, nuv + cdv * params.lensDistortion_amount , true).r;
    let imageColorG = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, nuv, true).g;
    let imageColorB = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, nuv - cdv * params.lensDistortion_amount , true).b;

    let chromaticAberration:vec4f = vec4(imageColorR, imageColorG, imageColorB, 1);
    // -- Chromatic Aberration


    let finalColor = chromaticAberration;
    // let finalColor = vec4(nuv,0,1) * WHITE;

    return finalColor;
}
`;

export default frag;
