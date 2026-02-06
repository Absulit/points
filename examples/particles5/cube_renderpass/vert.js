const vert = /*wgsl*/`

fn rotationMatrix(rotation: vec3f) -> mat3x3<f32> {
    let cx = cos(rotation.x);
    let sx = sin(rotation.x);
    let cy = cos(rotation.y);
    let sy = sin(rotation.y);
    let cz = cos(rotation.z);
    let sz = sin(rotation.z);

    // Combined rotation: Rz * Ry * Rx
    return mat3x3<f32>(
        vec3f(cy * cz, cy * sz, -sy),
        vec3f(sx * sy * cz - cx * sz, sx * sy * sz + cx * cz, sx * cy),
        vec3f(cx * sy * cz + sx * sz, cx * sy * sz - sx * cz, cx * cy)
    );
}

fn customVertexBody(position:vec4f, depth:vec4f, uv:vec2f, normal:vec3f, particle:Particle) -> CustomFragment {
    var result: CustomFragment;

    let ratioX = params.screen.x / params.screen.y;
    let ratioY = 1. / ratioX / (params.screen.y / params.screen.x);
    result.ratio = vec2(ratioX, ratioY);
    result.position = position;
    result.color = mix(vec4f(1,0,0,1), vec4f(1,1,0,1), particle.factor);
    result.uv = uv;
    result.uvr = vec2(uv.x * result.ratio.x, uv.y);
    result.mouse = vec2(params.mouse.x / params.screen.x, params.mouse.y / params.screen.y);
    result.mouse = result.mouse * vec2(1.,-1.) - vec2(0., -1.); // flip and move up
    result.depth = depth;
    result.noise = particle.noise;
    result.normal = normal;

    return result;
}

@vertex
fn main(in: VertexIn) -> CustomFragment {
    let particle = particles[in.instanceIndex];

    let model = rotationMatrix(particle.rotation);

    let rotated = model * in.position.xyz;
    let scaled = rotated * particle.scale;
    let world = scaled + particle.position;

    let clip = camera.camera_projection * camera.camera_view * vec4f(world, 1.0);

    let transformedNormal = model * in.normal;
    let newNormal = normalize(transformedNormal);

    let depth = vec4f(-particle.position.z / 253);

    return customVertexBody(clip, depth, in.uv, newNormal, particle);
}
`;

export default vert;
