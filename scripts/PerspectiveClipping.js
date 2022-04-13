/**
 * @param line {Line}
 * @returns {null|Line|*} new line (with two endpoints inside view volume)
 * or null (if line is completely outside view volume)
 */
function clipLinePerspective(line) {
    let zMin = Math.min(line.p0.z, line.p1.z)
    let out0 = outcodePerspective(line.p0, zMin);
    let out1 = outcodePerspective(line.p1, zMin);

    if (canTrivialAccept(out0, out1)) {
        return line
    }
    if (canTrivialReject(out0, out1)) {
        return null
    }

    // console.log("d")
    return investigateFurther(line, out0, out1)
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

/**
 *
 * @param line {Line}
 * @param out0 {number}
 * @param out1 {number}
 * @returns {Line}
 */
function investigateFurther(line, out0, out1) {
    if (out0 !== 0) {
        clipPointToViewVolume(line.p0, line.p1, out0)
    } else{
        clipPointToViewVolume(line.p1, line.p0, out1)
    }

    return line
}

function clipPointToViewVolume(clipPoint, otherPoint, outcode) {
    let line = new Line(clipPoint, otherPoint)

    // attempt to clip against each edge
    for (let edge of [LEFT, RIGHT, BOTTOM, TOP, NEAR, FAR]) {

        // check if point's outcode
        if ((outcode & edge) !== 0) {
            let intersection = findIntersectionPerspective(line, edge)
            copyVertex4(line.p0, intersection)
        }
    }
    return line.p0
}

/**
 *
 * @param line {Line} order of vertices matters - (clipPoint, otherPoint)
 * @param viewVolumeEdge {number} LEFT, RIGHT, BOTTOM, TOP, NEAR, FAR)
 */
function findIntersectionPerspective(line, viewVolumeEdge) {
    let [deltaX, deltaY, deltaZ] = calcDeltas3D(line)
    let zMin = Math.min(line.p0.z, line.p1.z)
    let x, y, z, t

    switch(viewVolumeEdge) {
        case LEFT:
            t = -(line.p0.x + line.p0.z) / (deltaX - deltaZ)
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

    return new Vector4(x, y, z, 1)
}