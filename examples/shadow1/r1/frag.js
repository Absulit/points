import { fnusin } from 'points/animation';
import { RED } from 'points/color';
import { structs } from './../structs.js';

const frag = /*wgsl*/`

${structs}
${fnusin}
${RED}


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



    let albedoColor = RED;
    let ambient = vec3f(.1, .1, .1); // ambient color

    let lightDirection = /*vec3f(fnusin(.6), fnusin(1), fnusin(-1.3)) +*/ params.lightPosition;
    let N = normalize(in.normal);
    let L = normalize(-lightDirection);
    let diffuse = max(dot(N, L), 0.0); // Lambertian term

    let viewDir = normalize(-params.cameraPosition + in.world); // direction to camera
    let reflectDir = reflect(L, N); // reflected light direction
    let specularStrength = .5;
    let shininess = 32.0;

    let specular = pow(max(dot(viewDir, reflectDir), 0.0), shininess) * specularStrength;
    let specularColor = vec3f(1., 1., 1.);


    let baseColor = albedoColor;

    let finalColor = ambient + baseColor.rgb * diffuse + specularColor * specular;

    // --- Shadow mapping ---
    // Convert from clip space to normalized device coords
    var proj = in.lightPos.xyz / in.lightPos.w;

    // Convert from [-1,1] to [0,1]
    var uv = proj.xy * .5 + vec2f(.5);
    let depthVal = proj.z * .5 + .5;

    let shadow = textureSampleCompare(depth, shadowSampler, uv, depthVal-params.val);

    // shadow = 1 -> lit, shadow = 0 -> fully shadowed
    let lighting = finalColor * shadow;

    return vec4f(vec3f(lighting), 1.0);


    // proj = in.lightPos.xyz / in.lightPos.w;
    // uv   = proj.xy * 0.5 + vec2f(0.5);
    // let dFrag = proj.z * 0.5 + 0.5;


    // let flippedUV = vec2f(in.uv.x, 1. - in.uv.y);
    // let texSize = vec2f(textureDimensions(depth, 0));
    // let coords = vec2i(flippedUV * texSize);
    // let d = textureLoad(depth, coords, 0);
    // let visual = pow(d, 1 * 100);

    // // “Manual” compare (assuming compare = less-equal)
    // let shadowManual = select(0.0, 1.0, dFrag <= d + params.val); // small bias

    // // Visualize: red = frag depth, green = map depth, blue = shadow bool
    // return vec4f(dFrag, d, shadowManual, 1.0);





}
`;

export default frag;
