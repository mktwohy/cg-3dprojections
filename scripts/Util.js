/**
 * Solves parametric equation for either x, y, or z
 * @param xyz0 {number} x0, y0, or z0
 * @param xyz1 {number} x1, y1, or z1
 * @param t {number}
 * @returns {number}
 */
function parametricXYZ(xyz0, xyz1, t) {
    return (1 - t) * xyz0 + t * xyz1
}

/**
 * Solves parametric equation for either x, y, or z
 * @param xyz {number} x, y, or z
 * @param xyz0 {number} x0, y0, or z0
 * @param xyz1 {number} x1, y1, or z1
 * @returns {number}
 */
function parametricT(xyz, xyz0, xyz1) {
    return (xyz - xyz0) / (xyz1 - xyz0)
}

/**
 * Calculate x, y, and z deltas
 * @param line {Line}
 * @returns {number[]}
 */
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

/**
 * Used after multiplying a vector by a matrix
 * @param matrix
 * @returns {Vector}
 */
function vector4FromMatrix(matrix) {
    return vector4FromArray(matrix.data)
}

/**
 * based off of Kotlin's built-in zipWithNext() function.
 *
 * Example:
 *
 * list = [1, 2, 3, 4, 5, 6]
 *
 * zipWithNext(list) = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
 * @param list {*[]}
 * @returns {*[][]}
 */
function zipWithNext(list) {
    let zipped = []
    for (let i = 0; i < list.length - 1; i++) {
        let a = list[i]
        let b = list[i+1]
        zipped.push([a, b])
    }

    return zipped
}