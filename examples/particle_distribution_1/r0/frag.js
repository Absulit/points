import { YELLOW } from "points/color";

const frag = /*wgsl*/`

${YELLOW}

@fragment
fn main(
    /**
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
    in: FragmentIn
) -> @location(0) vec4f {

    // Distance to nearest edge
    let edgeDist = min(min(in.barycentrics.x, in.barycentrics.y), in.barycentrics.z);
    let width = fwidth(edgeDist); // approximate derivative per pixel

    var finalColor = YELLOW;
    if(mesh.monkey == in.id){
        let wireframeColor = vec4f(params.wireframeColor / 255, 1);
        let fillColor = vec4f(params.fillColor / 255, params.opaque);
        finalColor = mix(fillColor, wireframeColor, step(edgeDist, width * params.thickness));
    }


    return finalColor;
}
`;

export default frag;
