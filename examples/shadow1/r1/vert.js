import { rotXAxis, rotYAxis, rotZAxis, TAU } from "points/math";
import { structs } from "./../structs.js";

const vert = /*wgsl*/`

${structs}
${rotXAxis}
${rotYAxis}
${rotZAxis}
${TAU}


fn translateMatrix(pos:vec3f) -> mat4x4f {
    return mat4x4f(
        vec4f(1.0, 0.0, 0.0, 0.0),
        vec4f(0.0, 1.0, 0.0, 0.0),
        vec4f(0.0, 0.0, 1.0, 0.0),
        vec4f(pos.x, pos.y, pos.z, 1.0)
    );
}

fn customVertexBody(position: vec4f, color: vec4f, uv: vec2f, normal: vec3f, world:vec3f) -> FragmentCustom {
    var result: FragmentCustom;

    let ratioX = params.screen.x / params.screen.y;
    let ratioY = 1. / ratioX / (params.screen.y / params.screen.x);
    result.ratio = vec2(ratioX, ratioY);
    result.position = position;
    result.color = color;
    result.uv = uv;
    result.uvr = vec2(uv.x * result.ratio.x, uv.y);
    result.mouse = vec2(params.mouse.x / params.screen.x, params.mouse.y / params.screen.y);
    result.mouse = result.mouse * vec2(1.,-1.) - vec2(0., -1.); // flip and move up
    result.normal = normal;
    result.world = world;

    return result;
}

/**
 * VertexIn
 * position: vec4f,
 * color: vec4f,
 * uv: vec2f,
 * normal: vec3f,
 * id: u32,       // mesh id
 * vertexIndex: u32,
 * instanceIndex: u32,
 */
@vertex
fn main(in: VertexIn) -> FragmentCustom {

    // if(mesh.plane1 == in.id){
        // rotX = rotXAxis(TAU * .33);
    // }

    let model = translateMatrix(vec3f());

    let world = model * in.position;
    let clip = camera.camera_projection * camera.camera_view * world;

    var cvb = customVertexBody(clip, in.color, in.uv, in.normal, world.xyz);
    // cvb.lightPos = (camera.light_projection * camera.light_view) * world;

    cvb.fragPos = cvb.position.xyz;

    // XY is in (-1, 1) space, Z is in (0, 1) space
    let posFromLight = (camera.light_projection * camera.light_view) * world;

    // Convert XY to (0, 1)
    // Y is flipped because texture coords are Y-down.
    cvb.shadowPos = vec3(
        posFromLight.xy * vec2(0.5, -0.5) + vec2(0.5),
        posFromLight.z
    );

    return cvb;
}
`;

export default vert;
