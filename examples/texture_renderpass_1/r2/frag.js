import { fnusin } from 'points/animation';
import { brightness, layer, RED, WHITE } from 'points/color';
import { TAU, PI, rotateVector, polar } from 'points/math';
import { snoise } from 'points/noise2d';
import { sdfLine, sdfSegment } from 'points/sdf';
import { texturePosition } from 'points/image';
const frag = /*wgsl*/`

${sdfSegment}
${sdfLine}
${rotateVector}
${PI}
${TAU}
${polar}
${snoise}
${layer}
${RED}
${WHITE}
${texturePosition}
${brightness}



@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let n1 = snoise(uv / params.sliderA);
    let imagePosition = vec2(0.0,0.0) * ratio;
    let center = vec2(.5,.5) * ratio;
    let d = distance(center, uvr); // sqrt(dot(d, d));

    //vector from center to current fragment
    let vectorToCenter = uvr - center;
    let sqrtDotCenter = sqrt(dot(center, center));

    //amount of effect
    let power =  2.0 * PI / (2.0 * sqrtDotCenter )  * (params.sliderA - 0.5);
    //radius of 1:1 effect
    var bind = .0;
    if (power > 0.0){
        //stick to corners
        bind = sqrtDotCenter;
    } else {
        //stick to borders
        if (ratio.x < 1.0) {
            bind = center.x;
        } else {
            bind = center.y;
        };
    }

    //Weird formulas
    var nuv = uvr;
    if (power > 0.0){//fisheye
        nuv = center + normalize(vectorToCenter) * tan(d * power) * bind / tan( bind * power);
    } else if (power < 0.0){//antifisheye
        nuv = center + normalize(vectorToCenter) * atan(d * -power * 10.0) * bind / atan(-power * bind * 10.0);
    } else {
        nuv = uvr;
    }

    let imageColor = texturePosition(feedbackTexture, imageSampler, imagePosition, nuv, false);

    let finalColor = imageColor;
    // let finalColor = vec4(nuv,0,1) * WHITE;

    return finalColor;
}
`;

export default frag;
