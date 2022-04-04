//console.log(mat4x4Perspective([0,10,-5],[20,15,-40], [1,1,0], [-12,6,-12,6,10,100] ));
// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {
    let n = new Vector(3);
    n = n.normalize(prp-srp);
    let u = new Vector(3);
    u = u.normalize(vup*n);
    let v = n*u;
    let dop = Vector3((clip[0]+clip[1])/2,(clip[2]+clip[3])/2,-(clip[4]));
    let start = new Matrix(4, 4);
    let matrix = mat4x4Identity(start);
    // 1. translate PRP to origin
    matrix = mat4x4Translate(matrix, prp[0][0], prp[1][0], prp[2][0]);
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let R = new Matrix(4, 4);
    R.values = [[u[0][0], u[1][0], u[2][0], 0],
        [v[0][0], v[1][0], v[2][0], 0],
        [n[0][0], n[1][0], n[2][0], 0],
        [0, 0, 0, 1]];
    //translate front clipping plane to origin
    let Tpar = new Matrix(4, 4);
    Tpar.values = [[1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, clip[4]],
        [0, 0, 0, 1]];
    // 3. shear such that CW is on the z-axis
    let SHx= -(dop[0])/dop[2];
    let SHy= -(dop[1])/dop[2];
    let SHpar = new Matrix(4,4);
    SHpar = mat4x4ShearXY(SHpar, SHx, SHy);
    // 4. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])
    let Sparx = 2/(clip[1]-clip[0]);
    let Spary = 2/(clip[3]-clip[2]);
    let Sparz = 1/ (clip[5]-clip[4]);
    let Spar = new Matrix(4,4);
    Spar = mat4x4Scale(Spar, Sparx, Spary, Sparz);
    let view = Matrix.multiply(R, matrix);
    let projection = Matrix.multiply(Spar, SHpar, Tpar);
    let Nper = Matrix.multiply(projection, view);
    //clip against the view fustrum?
    let transform = Matrix.multiply(mat4x4MPar(), Nper);
    return transform;
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    let n = new Vector(3);
    n = Vector.normalize(prp-srp);
    let u = new Vector(3);
    u = Vector.normalize(vup*n);
    let v = n*u;
    let dop = Vector3((clip[0]+clip[1])/2,(clip[2]+clip[3])/2,-(clip[4]));
    let start = new Matrix(4, 4);
    let matrix = mat4x4Identity(start);
    // 1. translate PRP to origin
    matrix = mat4x4Translate(matrix, prp[0][0], prp[1][0], prp[2][0]);
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let R = new Matrix(4, 4);
    R.values = [[u[0][0], u[1][0], u[2][0], 0],
        [v[0][0], v[1][0], v[2][0], 0],
        [n[0][0], n[1][0], n[2][0], 0],
        [0, 0, 0, 1]];
    // 3. shear such that CW is on the z-axis
    let SHx= -(dop[0])/dop[2];
    let SHy= -(dop[1])/dop[2];
    let SHper = new Matrix(4,4);
    SHper = mat4x4ShearXY(SHper, SHx, SHy);
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    let Sperx = (2*clip[4])/((clip[1]-clip[0])*clip[5]);
    let Spery = (2*clip[4])/((clip[3]-clip[2])*clip[5]);
    let Sperz = 1 / clip[5];
    let Sper = new Matrix(4,4);
    Sper = mat4x4Scale(Sper, Sperx, Spery, Sperz);
    let view = Matrix.multiply(R, matrix);
    let projection = Matrix.multiply(Sper, SHper);
    let Nper = Matrix.multiply(projection, view);
    //clip against the view fustrum?
    let transform = Matrix.multiply(mat4x4MPer(), Nper);
    return transform;
}

// create a 4x4 matrix to project a parallel image on the z=0 plane
function mat4x4MPar() {
    let mpar = new Matrix(4, 4);
    mper.values = [[1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0]];
    return mpar;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    mper.values = [[1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, -1, 0]];
    return mper;
}



///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0] ,
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the translate matrix
function mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = [[1, 0, 0, -(tx)],
        [0, 1, 0, -(ty)],
        [0, 0, 1, -(tz)],
        [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the scale matrix
function mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values = [[sx, 0, 0, 0],
        [0, sy, 0, 0],
        [0, 0, sz, 0],
        [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function mat4x4RotateX(mat4x4, theta) {
    mat4x4.values = [[1, 0, 0, 0],
        [0, Math.cos(theta), Math.sin(theta), 0],
        [0, -(Math.sin(theta)), Math.cos(theta), 0],
        [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function mat4x4RotateY(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta), 0, -(Math.sin(theta)), 0],
        [0, 1, 0, 0],
        [Math.sin(theta), 0, Math.cos(theta), 0],
        [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function mat4x4RotateZ(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta), -(Math.sin(theta)), 0, 0],
        [Math.sin(theta), Math.cos(theta), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function mat4x4ShearXY(mat4x4, shx, shy) {
    mat4x4.values = [[1, 0, shx, 0],
        [0, 1, shy, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]];
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