import { rotXAxis, rotYAxis, rotZAxis } from "points/math";

const vert = /*wgsl*/`

${rotXAxis}
${rotYAxis}
${rotZAxis}

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @location(4) id: u32,
    @location(5) barycentrics: vec3f,
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> Fragment {


    var angleZ = params.time * 0.9854;
    var angleY = params.time * 0.94222;
    var angleX = params.time * -0.865;

    if(id == mesh.cube0){
        angleZ = params.time * 0.1854;
        angleY = params.time * -0.694222;
        angleX = params.time * 0.4865;
    }
    if(id == mesh.cylinder0){
        angleZ = params.time * -0.2854;
        angleY = params.time * 0.594222;
        angleX = params.time * 0.1865;
    }

    let rotX = rotXAxis(angleX);
    let rotY = rotYAxis(angleY);
    let rotZ = rotZAxis(angleZ);
    let model = rotX * rotY * rotZ;

    var offset = vec4f(0,0,0,1);
    if(id == mesh.cube0){
        offset = vec4f(-1,0,0,1);
    }
    if(id == mesh.cylinder0){
        offset = vec4f(1,0,0,1);
    }
    if(id == mesh.sphere0){
        offset = vec4f(0,1,0,1);
    }
    if(id == mesh.torus0){
        offset = vec4f(0,-1,0,1);
    }

    let world = (offset + model * vec4f(position.xyz, 1.)).xyz;
    let clip = params.projection * params.view * vec4f(world, 1.);

    let newNormal = normalize((model * vec4f(normal, 0.)).xyz);

    var dvb = defaultVertexBody(clip, color, uv, newNormal);
    dvb.barycentrics = barycentrics;
    dvb.id = id;

    return dvb;
}
`;

export default vert;
