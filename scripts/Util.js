// solves either x, y, or z
function parametricXYZ(xyz0, xyz1, t) {
    return (1 - t) * xyz0 + t * xyz1
}

function parametricT(xyz, xyz0, xyz1) {
    return (xyz - xyz0) / (xyz1 - xyz0)
}

// line: Object { p0, p1 }
function calcDeltas3D(line){
    let deltaX = Math.abs(line.p0.x - line.p1.x)
    let deltaY = Math.abs(line.p0.y - line.p1.y)
    let deltaZ = Math.abs(line.p0.z - line.p1.z)
    return [deltaX, deltaY, deltaZ]
}

function canTrivialAccept(out0, out1) {
    return out0 | out1 === 0
}

function canTrivialReject(out0, out1) {
    return out0 & out1 !== 0
}

function vector4FromArray(array) {
    let [x2, y2, z3, w4] = array
    return Vector4(x2, y2, z3, w4)
}

function vector4FromMatrix(matrix) {
    return vector4FromArray(matrix.data)
}

function zipWithNext(list) {
    let zipped = []
    for (let i = 0; i < list.length - 1; i++) {
        let a = list[i]
        let b = list[i+1]
        zipped.push([a, b])
    }

    return zipped
}