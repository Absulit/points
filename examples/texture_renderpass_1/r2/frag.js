import { PI } from 'points/math';
import { snoise } from 'points/noise2d';
import { texture } from 'points/image';
const frag = /*wgsl*/`

${PI}
${snoise}
${texture}

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
    let center = vec2(.5) * ratio;
    let d = distance(center, uvr); // sqrt(dot(d, d));

    // vector from center to current fragment
    let vectorToCenter = uvr - center;
    let sqrtDotCenter = sqrt(dot(center, center));

    // amount of effect
    let power =  2.0 * PI / (2.0 * sqrtDotCenter) * (params.sliderA - 0.5);
    // radius of 1:1 effect
    var bind = .0;
    if (power > 0.0){
        // stick to corners
        bind = sqrtDotCenter;
    } else {
        // stick to borders
        // if (ratio.x < 1.0) {bind = center.x;} else {bind = center.y;};
        bind = mix(center.x, center.y, step(ratio.x, 1));
    }

    // Weird formulas
    var nuv = uvr;
    if (power > 0.0){
        //fisheye
        nuv =
            center +
            normalize(vectorToCenter) *
            tan(d * power) * bind / tan(bind * power);
    } else if (power < 0.0){
        //antifisheye
        nuv =
            center +
            normalize(vectorToCenter) *
            atan(d * -power * 10.0) *
            bind / atan(-power * bind * 10.0);
    }

    let finalColor = texture(feedbackTexture, imageSampler, nuv, false);

    return finalColor;
}
`;

export default frag;
