import { rotXAxis, rotYAxis, rotZAxis } from 'points/math';
import { structs } from '../structs.js';

const vert = /*wgsl*/`

${structs}
${rotXAxis}
${rotYAxis}
${rotZAxis}

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

@vertex
fn main(in: VertexIn) -> FragmentCustom {
    // var angleZ = params.time * 0.9854;
    var angleY = params.time * 0.94222;
    // var angleX = params.time * 0.865;

    let rotX = rotXAxis(0);
    let rotY = rotYAxis(angleY);
    let rotZ = rotZAxis(0);
    let model = rotX * rotY * rotZ;

    let world = (model * vec4f(in.position.xyz, 1.)).xyz;
    let clip = camera.camera_projection * camera.camera_view * vec4f(world, 1.);

    let newNormal = normalize((model * vec4f(in.normal, 0.)).xyz);

    var dvb = customVertexBody(clip, in.color, in.uv, newNormal, world);
    dvb.id = in.id;

    return dvb;
}
`;

export default vert;
