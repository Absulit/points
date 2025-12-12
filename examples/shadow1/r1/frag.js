import { structs } from '../structs.js';
import { blur9 } from 'points/effects';
import { texture } from 'points/image';
import { rotateVector } from 'points/math';

const frag = /*wgsl*/`

${structs}
${texture}
${rotateVector}

fn translateMatrix(pos:vec3f) -> mat4x4f {
    return mat4x4f(
        vec4f(1.0, 0.0, 0.0, 0.0),
        vec4f(0.0, 1.0, 0.0, 0.0),
        vec4f(0.0, 0.0, 1.0, 0.0),
        vec4f(pos.x, pos.y, pos.z, 1.0)
    );
}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {
    // 1) sample stored depth (linear 0..1)
    let flippedUV = vec2f(in.uv.x, 1. - in.uv.y);
    let texSize = vec2f(textureDimensions(depth, 0));
    let coords = vec2i(flippedUV * texSize);
    let d = textureLoad(depth, coords, 0);

    // 2) reconstruct NDC (x,y from uv -> [-1,1], z from depth -> [-1,1])
    let ndc = vec4f(in.uv * 2.0 - vec2f(1.0, 1.0), d * 2.0 - 1.0, 1.0);

    // 3) reconstruct world position
    let invViewProj = translateMatrix(-params.cameraPosition);
    let worldPos4 = invViewProj * ndc;
    let worldPos = (worldPos4.xyz / worldPos4.w);

    // 4) project into light space
    let lightViewProj = translateMatrix(params.lightPosition);
    let lightClip = lightViewProj * vec4f(worldPos, 1.0);
    let lightNDC = lightClip.xyz / lightClip.w;
    let lightUV = vec3f(lightNDC.xy * 0.5 + vec2f(0.5), lightNDC.z * 0.5 + 0.5);

    // 5) shadow test (with bias)
    let bias = 0.001;
    let vis = textureSampleCompare(depth, shadowSampler, lightUV.xy, lightUV.z + bias);

    // 6) combine with your color (sampled elsewhere)

    let base = texture(feedbackTexture, imageSampler, in.uvr, true);
    let shadowed = mix(base * (1.0 - 0.6), base, vis); // example darkness 0.6
    return shadowed;
}
`;

export default frag;
