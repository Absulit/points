const compute = /*wgsl*/`


// ComputeIn
// @builtin(global_invocation_id) GID: vec3u,
// @builtin(workgroup_id)  in.WID: vec3u,
// @builtin(local_invocation_id) LID: vec3u
@compute @workgroup_size(64)
fn main(in: ComputeIn) {
    var index = in.GID.x;

    var vPos = particlesA[index].pos;
    var vVel = particlesA[index].vel;
    var cMass = vec2(0.0);
    var cVel = vec2(0.0);
    var colVel = vec2(0.0);
    var cMassCount = 0u;
    var cVelCount = 0u;
    var pos:vec2f;
    var vel:vec2f;

    for (var i = 0u; i < 1024; i++) {
        if (i == index) {
            continue;
        }

        pos = particlesA[i].pos.xy;
        vel = particlesA[i].vel.xy;
        if (distance(pos, vPos) < params.rule1Distance) {
            cMass += pos;
            cMassCount++;
        }
        if (distance(pos, vPos) < params.rule2Distance) {
            colVel -= pos - vPos;
        }
        if (distance(pos, vPos) < params.rule3Distance) {
            cVel += vel;
            cVelCount++;
        }
    }

    if (cMassCount > 0) {
        cMass = (cMass / vec2(f32(cMassCount))) - vPos;
    }
    if (cVelCount > 0) {
        cVel /= f32(cVelCount);
    }
    vVel += (cMass * params.rule1Scale) + (colVel * params.rule2Scale) + (cVel * params.rule3Scale);

    // clamp velocity for a more pleasing simulation
    vVel = normalize(vVel) * clamp(length(vVel), 0.0, 0.1);

    // kinematic update
    vPos = vPos + (vVel * params.time);

    // Wrap around boundary
    if (vPos.x < -1.0) {
        vPos.x = 1.0;
    }
    if (vPos.x > 1.0) {
        vPos.x = -1.0;
    }
    if (vPos.y < -1.0) {
        vPos.y = 1.0;
    }
    if (vPos.y > 1.0) {
        vPos.y = -1.0;
    }

    // Write back
    particlesB[index].pos = vPos;
    particlesB[index].vel = vVel;
}
`;

export default compute;
