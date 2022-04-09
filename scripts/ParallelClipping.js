// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLineParallel(line) {
    let p0 = vector4FromArray(line.p0.data);
    let p1 = vector4FromArray(line.p1.data);

    let out0 = outcodeParallel(p0);
    let out1 = outcodeParallel(p1);

    if (canTrivialAccept(out0, out1)) {
        return makeLine(p0, p1)
    }
    if (canTrivialReject(out0, out1)) {
        return null
    }

    p0 = clipPointParallel(p0, out0)
    p1 = clipPointParallel(p1, out1)

    return makeLine(p0, p1)
}

// Get outcode for vertex (parallel view volume)
function outcodeParallel(vertex) {
    let outcode = 0;
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += LEFT;
    } else if (vertex.x > (1.0 + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (-1.0 - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    } else if (vertex.y > (1.0 + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    } else if (vertex.z > (0.0 + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// p: Vector4
// outcode: Number
function clipPointParallel(p, outcode) {
    let newPoint = p
    for (let edge in [LEFT, RIGHT, BOTTOM, TOP, FAR, NEAR]) {
        let edgeCode = Number(edge)

        if (outcode & edgeCode !== 0) {
            newPoint = findIntersectionParallel(newPoint, edgeCode)
        }
    }
    return newPoint
}

// line: Object { p0, p1 }
// edge: constant direction (LEFT, RIGHT, BOTTOM, TOP, FAR, NEAR)
// viewVolume: Object { left, right, bottom, top, far, near } dimensions of view volume
function findIntersectionParallel(line, edge) {
    let x, y, z, t

    switch(edge) {
        case LEFT:
            x = -1
            t = parametricT(x, line.p0.x, line.p1.x)
            y = parametricXYZ(line.p0.y, line.p1.y, t)
            z = parametricXYZ(line.p0.z, line.p1.z, t)
            break
        case RIGHT:
            x = 1
            t = parametricT(x, line.p0.x, line.p1.x)
            y = parametricXYZ(line.p0.y, line.p1.y, t)
            z = parametricXYZ(line.p0.z, line.p1.z, t)
            break
        case BOTTOM:
            y = -1
            t = parametricT(y, line.p0.y, line.p1.y)
            x = parametricXYZ(line.p0.x, line.p1.x, t)
            z = parametricXYZ(line.p0.z, line.p1.z, t)
            break
        case TOP:
            y = 1
            t = parametricT(y, line.p0.y, line.p1.y)
            x = parametricXYZ(line.p0.x, line.p1.x, t)
            z = parametricXYZ(line.p0.z, line.p1.z, t)
            break
        case NEAR:
            z = 0
            t = parametricT(z, line.p0.z, line.p1.z)
            x = parametricXYZ(line.p0.x, line.p1.x, t)
            y = parametricXYZ(line.p0.y, line.p1.y, t)
            break
        case FAR:
            z = -1
            t = parametricT(z, line.p0.z, line.p1.z)
            x = parametricXYZ(line.p0.x, line.p1.x, t)
            y = parametricXYZ(line.p0.y, line.p1.y, t)
            break
        default:
            x = 0; y = 0; z = 0
    }
    return Vector4(x, y, z, 1)
}