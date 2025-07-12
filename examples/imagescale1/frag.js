import { texturePosition } from 'points/image';
import { layer } from 'points/color';

const frag = /*wgsl*/`

${texturePosition}
${layer}

fn texture(texture:texture_2d<f32>, aSampler:sampler, uv:vec2f, crop:bool) -> vec4f {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims:vec2u = textureDimensions(texture, 0);
    let dimsF32 = vec2f(dims);

    let minScreenSize = min(params.screen.y, params.screen.x);
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition =  vec2(0., 1.);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;

    var rgbaImage = textureSample(texture, aSampler, imageUV);

    // e.g. if uv.x < 0. OR uv.y < 0. || uv.x > imageRatio.x OR uv.y > imageRatio.y
    if (crop && (any(uv < vec2(0.0)) || any(uv > imageRatio))) {
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}


@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    // let startPosition = vec2(0.,0.);
    // let rgbaImage1 = texturePosition(image1, imageSampler, startPosition, uvr, false);
    // let rgbaImage2 = texturePosition(image2, imageSampler, startPosition, uvr, true);
    // let rgbaImage3 = texturePosition(image3, imageSampler, startPosition, uvr - vec2f(.1), true);

    let rgbaImage1 = texture(image1, imageSampler, uvr, false);
    let rgbaImage2 = texture(image2, imageSampler, uvr, true);
    let rgbaImage3 = texture(image3, imageSampler, uvr, true);

    let finalColor = layer(rgbaImage1, layer(rgbaImage2, rgbaImage3));

    return finalColor;
}
`;

export default frag;
