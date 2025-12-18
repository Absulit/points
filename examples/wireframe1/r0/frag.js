import { wireframe } from 'points/effects';

const frag = /*wgsl*/`

${wireframe}

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

    let wireframeColor = vec4f(params.wireframeColor / 255, 1);
    let fillColor = vec4f(params.fillColor / 255, params.opaque);

    return wireframe(wireframeColor, fillColor, params.thickness, in.barycentrics);
}
`;

export default frag;
