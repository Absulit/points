import { texture } from 'points/image';
const frag = /*wgsl*/`

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

    let imageColor = texture(feedbackTexture, imageSampler, uvr, true);

    // --------- chromatic displacement vector
    let cdv = vec2(params.sliderB, 0.);
    let d = distance(vec2(.5), uvr);
    let imageColorR = texture(feedbackTexture, imageSampler, uvr + cdv * d, true).r;
    let imageColorG = texture(feedbackTexture, imageSampler, uvr, true).g;
    let imageColorB = texture(feedbackTexture, imageSampler, uvr - cdv * d, true).b;

    let finalColor = vec4(imageColorR, imageColorG, imageColorB, 1);

    return finalColor;
}
`;

export default frag;
