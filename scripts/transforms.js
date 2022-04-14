/**
 * calls either mat4x4Nper or mat4x4Npar, depending on the current projection type
 * @returns {Matrix}
 */
function mat4x4N(projectionType, prp, srp, vup, clip) {
    if (projectionType === PERSPECTIVE){
        return mat4x4Nper(prp, srp, vup, clip)
    } else {
        return mat4x4Npar(prp, srp, vup, clip)
    }
}

/**
 * calls either mat4x4Mper or mat4x4Mpar, depending on the current projection type
 * @returns {Matrix}
 */
function mat4x4M(projectionType) {
    if (projectionType === PERSPECTIVE){
        return mat4x4Mper()
    } else {
        return mat4x4Mpar()
    }
}

// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Npar(prp, srp, vup, clip) {
    let [left, right, bottom, top, near, far] = clip

    let dop = Vector3(0, 0, -near);

    // 1. translate PRP to origin
    let T = mat4x4T(prp)

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let R = mat4x4R(prp, srp, vup)

    // 3. shear such that CW is on the z-axis
    let SHx = -dop.x / dop.z;
    let SHy = -dop.y / dop.z;
    let SHpar = new Matrix(4,4);
    mat4x4ShearXY(SHpar, SHx, SHy);

    // translate front clipping plane to origin
    let Tpar = new Matrix(4, 4);
    mat4x4Translate(Tpar, 0, 0, near)

    // 4. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])
    let Sparx = 2 / (right - left);
    let Spary = 2 / (top - bottom);
    let Sparz = 1 / far;
    let Spar = new Matrix(4,4);
    mat4x4Scale(Spar, Sparx, Spary, Sparz);

    return Matrix.multiply([Spar, Tpar, SHpar, R, T])
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Nper(prp, srp, vup, clip) {
    let [left, right, bottom, top, near, far] = clip

    // 1. translate PRP to origin
    let T = mat4x4T(prp)

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let R = mat4x4R(prp, srp, vup)

    // 3. shear such that CW is on the z-axis
    let dop = Vector3((left + right)/2, (bottom + top)/2, -near);
    let SHx = -(dop.x)/dop.z;
    let SHy = -(dop.y)/dop.z;

    let SHper = new Matrix(4,4);
    mat4x4ShearXY(SHper, SHx, SHy);

    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    let Sperx = (2 * near) / ((right - left) * far);
    let Spery = (2 * near) / ((top - bottom) * far);
    let Sperz = 1 / far;

    let Sper = new Matrix(4,4);
    mat4x4Scale(Sper, Sperx, Spery, Sperz);

    return Matrix.multiply([Sper, SHper, R, T]);
}

// create a 4x4 matrix to project a parallel image on the z=0 plane
function mat4x4Mpar() {
    let mpar = new Matrix(4, 4);
    mpar.values = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 1]
    ];
    return mpar;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4Mper() {
    let mper = new Matrix(4, 4);
    mper.values = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, -1, 0]
    ];
    return mper;
}

// create a 4x4 matrix to scale to window
function mat4x4V(width, height) {
    let w2 = width / 2
    let h2 = height / 2
    let V = new Matrix(4, 4)
    V.values = [
        [w2, 0 ,0, w2],
        [0, h2, 0, h2],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]
    return V
}

// create 4x4 matrix to rotate VRC such that (u, v, n) align with x, y, z
function mat4x4R(prp, srp, vup) {
    let [u, v, n] = calcUVN(prp, srp, vup)
    let R = new Matrix(4, 4);
    R.values = [
        [u.x, u.y, u.z, 0],
        [v.x, v.y, v.z, 0],
        [n.x, n.y, n.z, 0],
        [0, 0, 0, 1]
    ];
    return R
}

function mat4x4T(prp) {
    let T = new Matrix(4, 4);
    mat4x4Translate(T, prp.x, prp.y, prp.z);
    return T
}
///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////
function calcUVN(prp, srp, vup) {
    let n = prp.subtract(srp);
    n.normalize();

    let u = vup.cross(n);
    u.normalize();

    let v = n.cross(u);
    return [u, v, n]
}
function calcU(prp, srp, vup) {
    let n = prp.subtract(srp);
    n.normalize();

    let u = vup.cross(n);
    u.normalize();

    return u;
}
function calcN(prp, srp, vup) {
    let n = prp.subtract(srp);
    n.normalize();
    
    return n;
}
function calcV(prp, srp, vup) {
    let n = prp.subtract(srp);
    n.normalize();

    let u = vup.cross(n);
    u.normalize();

    let v = n.cross(u);
    return v
}

// /**
//  *
//  * @param mat4x4 {Matrix}
//  * @param u {Vector} normalized vector that represents the axis
//  * @param theta
//  * @return {Matrix}
//  */
// function mat4x4RotateFromAxisAndAngle(mat4x4, u, theta) {
//     let ct = Math.cos(theta)
//     let st = Math.sin(theta)
//
//     mat4x4.values = [
//         [ct + u.x**2 * (1 - ct),            u.x * u.y * (1 - ct) - u.z * st,    u.x * u.z * (1 - ct) + u.y * st,    0],
//         [u.y * u.x * (1 - ct) + u.z * st,   ct + u.y**2 * (1 - ct),             u.y * u.z * (1 - ct) - u.x * st,    0],
//         [u.z * u.x * (1 - ct) - u.y * st,   u.z * u.y * (1 - ct) + u.x * st,    ct + u.z**2 * (1 - ct),             0],
//         [0,                                 0,                                  0,                                  1]
//     ]
// }

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [
        [1, 0, 0, 0] ,
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

// set values of existing 4x4 matrix to the translate matrix
function mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = [
        [1, 0, 0, -(tx)],
        [0, 1, 0, -(ty)],
        [0, 0, 1, -(tz)],
        [0, 0, 0, 1]
    ];
}

// set values of existing 4x4 matrix to the scale matrix
function mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values = [
        [sx, 0, 0, 0],
        [0, sy, 0, 0],
        [0, 0, sz, 0],
        [0, 0, 0, 1]
    ];
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function mat4x4RotateX(mat4x4, theta) {
    mat4x4.values = [
        [1, 0, 0, 0],
        [0, Math.cos(theta), Math.sin(theta), 0],
        [0, -(Math.sin(theta)), Math.cos(theta), 0],
        [0, 0, 0, 1]
    ];
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function mat4x4RotateY(mat4x4, theta) {
    mat4x4.values = [
        [Math.cos(theta), 0, -(Math.sin(theta)), 0],
        [0, 1, 0, 0],
        [Math.sin(theta), 0, Math.cos(theta), 0],
        [0, 0, 0, 1]
    ];
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function mat4x4RotateZ(mat4x4, theta) {
    mat4x4.values = [
        [Math.cos(theta), -(Math.sin(theta)), 0, 0],
        [Math.sin(theta), Math.cos(theta), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function mat4x4ShearXY(mat4x4, shx, shy) {
    mat4x4.values = [
        [1, 0, shx, 0],
        [0, 1, shy, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}