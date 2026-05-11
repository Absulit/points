const compute = /*wgsl*/`


// ComputeIn
// @builtin(global_invocation_id) GID: vec3u,
// @builtin(workgroup_id)  in.WID: vec3u,
// @builtin(local_invocation_id) LID: vec3u
@compute @workgroup_size(THREADS_X, THREADS_Y, THREADS_Z)
fn main(in: ComputeIn) {
    let index = in.GID.x;
    if (index >= u32(NUMPARTICLES)) { return; }

    var vPos = particlesA[index].pos;
    var vVel = particlesA[index].vel;

    var cMass = vec2f(0.0);
    var cVel = vec2f(0.0);
    var colVel = vec2f(0.0);
    var cMassCount = 0u;
    var cVelCount = 0u;

    for (var i = 0u; i < u32(NUMPARTICLES); i++) {
        if (i == index) { continue; }

        let pos = particlesA[i].pos;
        let vel = particlesA[i].vel;
        let dist = distance(pos, vPos);

        // Rule 1: Cohesion
        if (dist < params.rule1Distance) {
            cMass += pos;
            cMassCount++;
        }
        // Rule 2: Separation
        if (dist < params.rule2Distance) {
            colVel -= (pos - vPos);
        }
        // Rule 3: Alignment
        if (dist < params.rule3Distance) {
            cVel += vel;
            cVelCount++;
        }
    }

    if (cMassCount > 0) {
        cMass = (cMass / f32(cMassCount)) - vPos;
    }
    if (cVelCount > 0) {
        cVel /= f32(cVelCount);
    }

    vVel += (cMass * params.rule1Scale) + (colVel * params.rule2Scale) + (cVel * params.rule3Scale);

    // Clamp and update
    vVel = normalize(vVel) * clamp(length(vVel), 0.001, 0.1);
    vPos += vVel * params.deltaT;

    // Boundary Wrap
    if (vPos.x < -1.0) { vPos.x = 1.0; } else if (vPos.x > 1.0) { vPos.x = -1.0; }
    if (vPos.y < -1.0) { vPos.y = 1.0; } else if (vPos.y > 1.0) { vPos.y = -1.0; }

    // Write to the output buffer
    particlesB[index].pos = vPos;
    particlesB[index].vel = vVel;

}
`;

export default compute;
