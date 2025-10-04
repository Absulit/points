const vert = /*wgsl*/`


fn rotateX(p:vec3<f32>, rads:f32 ) -> vec3<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let znew = p.z * c - p.y * s;
    let ynew = p.z * s + p.y * c;
    return vec3(p.x, ynew, znew);
}

fn rotateY(p:vec3<f32>, rads:f32 ) -> vec3<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.z * s;
    let znew = p.x * s + p.z * c;
    return vec3(xnew, p.y, znew);
}

fn rotateZ(p:vec3<f32>, rads:f32 ) -> vec3<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.y * s;
    let ynew = p.x * s + p.y * c;
    return vec3(xnew, ynew, p.z);
}

fn rotZAxis(rads:f32) -> mat4x4f {
    return mat4x4f(
        cos(rads),   -sin(rads),   0.0, 0.0,
        sin(rads),    cos(rads),   0.0, 0.0,
        0.0,          0.0,         1.0, 0.0,
        0.0,          0.0,         0.0, 1.0
    );
}

fn rotYAxis(rads:f32) -> mat4x4f {
    return mat4x4f(
        cos(rads),   0.0, sin(rads),   0.0,
        0.0,         1.0, 0.0,         0.0,
       -sin(rads),   0.0, cos(rads),   0.0,
        0.0,         0.0, 0.0,         1.0
    );
}

fn rotXAxis(rads:f32) -> mat4x4f {
    return mat4x4f(
        1.0, 0.0,          0.0,         0.0,
        0.0, cos(rads),   -sin(rads),   0.0,
        0.0, sin(rads),    cos(rads),   0.0,
        0.0, 0.0,          0.0,         1.0
    );
}


@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> Fragment {
    let angleZ = params.time * 0.9854;
    let angleY = params.time * 0.94222;
    let angleX = params.time * 0.865;

    let rotX = rotXAxis(angleX);
    let rotY = rotYAxis(angleY);
    let rotZ = rotZAxis(angleZ);

    let model = rotX * rotY * rotZ;

    let world = (model * vec4f(position.xyz, 1.)).xyz;
    let clip = params.projection * params.view * vec4f(world, 1.);

    let newNormal = normalize((model * vec4f(normal, 0.)).xyz);

    return defaultVertexBody(clip, color, uv, newNormal);
}
`;

export default vert;
