import { fnusin } from 'points/animation';
import { RED } from 'points/color';
import { structs } from './../structs.js';

const frag = /*wgsl*/`

${structs}
${fnusin}
${RED}

const shadowDepthTextureSize = 1024.;
const albedo = vec3f(0.9); //RED.xyz * .9;
const ambientFactor = .2;

/**
 * VertexIn
 * position: vec4f,
 * color: vec4f,
 * uv: vec2f,
 * ratio: vec2f,  // relation between params.screen.x and params.screen.y
 * uvr: vec2f,    // uv with aspect ratio corrected
 * mouse: vec2f,
 * normal: vec3f,
 * id: u32,       // mesh or instance id
 * barycentrics: vec3f,
 */
@fragment
fn main(in: FragmentCustom) -> @location(0) vec4f {
    // Percentage-closer filtering. Sample texels in the region
    // to smooth the result.
    var visibility = 0.0;
    let oneOverShadowDepthTextureSize = 1.0 / shadowDepthTextureSize;
    for (var y = -1; y <= 1; y++) {
        for (var x = -1; x <= 1; x++) {
            let offset = vec2f(vec2(x, y)) * oneOverShadowDepthTextureSize;

            visibility += textureSampleCompare(
                depth, shadowSampler,
                in.shadowPos.xy + offset, in.shadowPos.z - 0.007
            );
        }
    }
    visibility /= 9.0;

    let lambertFactor = max(dot(normalize(params.lightPos - in.fragPos), normalize(in.normal)), 0.);
    let lightingFactor = min(ambientFactor + visibility * lambertFactor, 1.);

    // return vec4(vec3f(lightingFactor * albedo), 1.);
    return vec4(vec3f(visibility), 1.);
}
`;

export default frag;
