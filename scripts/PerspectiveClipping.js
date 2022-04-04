// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    let p0 = Vector3(line.p0.x, line.p0.y, line.p0.z);
    let p1 = Vector3(line.p1.x, line.p1.y, line.p1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);

    if (canTrivialAccept(out0, out1)) {
        return { p0: p0, p1: p1 }
    }
    if (canTrivialReject(out0, out1)) {
        return null
    }

    p0 = clipPointPerspective(p0, out0)
    p1 = clipLinePerspective(p1, out1)

    return { p0: p0, p1: p1 }
}

// Get outcode for vertex (perspective view volume)
function outcodePerspective(vertex, z_min) {
    let outcode = 0;
    if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (z_min + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// p: Object { x, y, z }
// outcode: Number
function clipPointPerspective(p, outcode) {
    let newPoint = p
    for (let edge in [LEFT, RIGHT, BOTTOM, TOP, FAR, NEAR]) {
        let edgeCode = Number(edge)

        if (outcode & edgeCode !== 0) {
            newPoint = findIntersectionPerspective(newPoint, edgeCode)
        }
    }
    return newPoint
}

function findIntersectionPerspective(line, edge,) {
    let [deltaX, deltaY, deltaZ] = calcDeltas3D(line)
    let zMin = Math.min(line.p0.z, line.p1.z)
    let x, y, z, t

    switch(edge) {
        case LEFT:
            t = -(line.p0.x + line.p0.z) / deltaX
            z = parametricXYZ(line.p0.z, line.p1.z, t)
            x = z
            y = parametricXYZ(line.p0.y, line.p1.y, t)
            break
        case RIGHT:
            t = (line.p0.x + line.p0.z) / (-deltaX - deltaZ)
            z = parametricXYZ(line.p0.z, line.p1.z, t)
            x = -z
            y = parametricXYZ(line.p0.y, line.p1.y, t)
            break
        case BOTTOM:
            t =  (-line.p0.y + line.p0.z) / (deltaY - deltaZ)
            z = parametricXYZ(line.p0.z, line.p1.z, t)
            x = parametricXYZ(line.p0.x, line.p1.x, t)
            y = z
            break
        case TOP:
            t = (line.p0.y + line.p0.z) / (-deltaY - deltaZ)
            z = parametricXYZ(line.p0.z, line.p1.z, t)
            x = parametricXYZ(line.p0.x, line.p1.x, t)
            y = -z
            break
        case NEAR:
            t = (line.p0.z - zMin) / -deltaZ
            z = zMin
            x = parametricXYZ(line.p0.x, line.p1.x, t)
            y = parametricXYZ(line.p0.y, line.p1.y, t)
            break
        case FAR:
            t = (-line.p0.z - 1) / deltaZ
            z = -1
            x = parametricXYZ(line.p0.x, line.p1.x, t)
            y = parametricXYZ(line.p0.y, line.p1.y, t)
            break
        default:
            x = 0; y = 0; z = 0
    }
    return { x: x, y: y, z: z }
}