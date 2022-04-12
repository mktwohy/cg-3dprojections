let view;

/** @type CanvasRenderingContext2D */
let ctx;
let scene;
let start_time;

const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

const PERSPECTIVE = 'perspective';
const PARALLEL = 'parallel';

// Initialization function - called when web page loads
function init() {
    console.log("CALL: init()")
    let w = 800;
    let h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: PERSPECTIVE,
            prp: Vector3(44, 20, -16),
            srp: Vector3(20, 20, -40),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4(0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4(0, 12, -30, 1),
                    Vector4(0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ],
                matrix: new Matrix(4, 4)
            }, {
                type: "cube",
                center: [4, 4, -10],
                width: 8,
                height: 8,
                depth: 8
            }/*,
            {
                type: "cylinder",
                center: [12, 10, -49],
                radius: 1.5,
                height: 5,
                sides: 12
                /*
                "animation": {
                    "axis": "y",
                    "rps": 0.5
                }
                */
        
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', onKeyDown, false);
    
    // start animation loop
    start_time = performance.now(); // current timestamp in milliseconds
    window.requestAnimationFrame(animate);
}

// Animation loop - repeatedly calls rendering code
function animate(timestamp) {
    ctx.clearRect(0, 0, view.width, view.height)

    // step 1: calculate time (time since start)
    let time = timestamp - start_time;
    
    // step 2: transform models based on time
    //if ()

    // step 3: draw scene
    drawScene();

    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
    window.requestAnimationFrame(animate);
}
//centerPoint, width, height, depth
function setCube(centerPoint, width, height, depth) {
    let vertices;
    vertices: [Vector4(0, 30, -40, 1), Vector4(0, 40, -40, 1),  
        Vector4(-10, 30, -40, 1),
        Vector4(-10, 40, -40, 1), 
        Vector4(0, 30, -50, 1),
        Vector4(0, 40, -50, 1), 
        Vector4(-10, 30, -50, 1),
        Vector4(-10, 40, -50, 1)];
    /*
    vertices[0] = Vector4(0, 30, -40, 1);
    scene.models.vertices[1] = Vector4(0, 40, -40, 1);
    scene.models.vertices[2] = Vector4(-10, 30, -40, 1);
    scene.models.vertices[3] = Vector4(-10, 40, -40, 1);
    scene.models.vertices[4] = Vector4(0, 30, -50, 1);
    scene.models.vertices[5] = Vector4(0, 40, -50, 1);
    scene.models.vertices[6] = Vector4(-10, 30, -50, 1)
    scene.models.vertices[7] = Vector4(-10, 40, -50, 1)
    */
    let edges;
    edges: [0, 1, 2, 3, 4, 0];
    let model = [vertices][edges]

    /*
    edge[0] = vertices[0];
    edge[1] = vertices[1];
    edge[2] = vertices[3];
    edge[3] = vertices[2];
    */
    
    
}


// Main drawing code - use information contained in variable `scene`
function drawScene() {
    // console.log("CALL: drawScene()")
    // console.log("SCENE: ", scene);
    //loadNewScene();
    setCube();

    //need to add the clear screen call

    let N
    let M
    if (scene.view.type === PERSPECTIVE){
        N = mat4x4Nper(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip)
        M = mat4x4Mper()
    } else {
        N = mat4x4Npar(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip)
        M = mat4x4Mpar()
    }

    let V = mat4x4V(view.width, view.height)


    for (let model of scene.models){
        if(model.type == "cube") {
            setCube();
        }
        for (let edge of model.edges){

            // an edge can have multiple lines, so we need to iterate through each vertex, two at a time
            for (let i = 0; i < edge.length - 1; i++) {
                let p0 = model.vertices[edge[i]]
                let p1 = model.vertices[edge[i+1]]

                // multiply by N
                p0 = N.mult(p0)
                p1 = N.mult(p1)

                // clip in 3D
                let line = makeLine(p0, p1)

                if (scene.view.type === PERSPECTIVE){
                    line = clipLinePerspective(line)
                } else {
                    line = clipLineParallel(line)
                }

                p0 = vector4FromArray(line.p0.data)
                p1 = vector4FromArray(line.p1.data)

                // clipLineParallel/Perspective() can return null, so we need to check
                if (p0 !== null && p1 !== null) {
                    // project to 2D
                    p0 = Matrix.multiply([V, M, p0])
                    p1 = Matrix.multiply([V, M, p1])

                    // convert back to vector (mult() returns a 4x4 matrix)
                    p0 = vector4FromArray(p0.data)
                    p1 = vector4FromArray(p1.data)

                    // draw line
                    drawLine(p0.x/p0.w, p0.y/p0.w, p1.x/p1.w, p1.y/p1.w)
                }
            }
        }
    }
}

// Called when user presses a key on the keyboard down 
function onKeyDown(event) {
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            let v = calcV(scene.view.prp, scene.view.srp, scene.view.vup);
            //move prp to origin 
            let T1 = mat4x4T(scene.view.prp);
            //rotate the VRC such that (u,v,n) align with (x,y,z)
            let R = mat4x4R(prp, srp, vup)

            let origin = R.mult(T1);
            

            //rotate the SRP based on v?

            //move back?

            //multiplying 5 matrices: one to move, rotate vrc, rotate y , un rotate the VRC, move back to orignal spot.

            scene.view.prp.x += 1
            scene.view.srp.x += 1
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            let v0 = calcV(scene.view.prp, scene.view.srp, scene.view.vup);
            let T = mat4x4T(scene.view.prp);
            scene.view.prp.x -= 1
            scene.view.srp.x -= 1
            break;
        case 65: // A key
            console.log("A");
            let u = calcU(scene.view.prp, scene.view.srp, scene.view.vup);
            let u4 = scene.view.prp.subtract(u)
            let u5 = scene.view.srp.subtract(u)

            scene.view.prp = u4
            scene.view.srp = u5
            break;
        case 68: // D key
            console.log("D");
            let u1 = calcU(scene.view.prp, scene.view.srp, scene.view.vup);
            let u0 = scene.view.prp.add(u1)
            let u2 = scene.view.srp.add(u1)

            scene.view.prp = u0
            scene.view.srp = u2
            break;
        case 83: // S key
            console.log("S");
            let n = calcN(scene.view.prp, scene.view.srp, scene.view.vup);
            let n3 = scene.view.prp.subtract(n)
            let n4 = scene.view.srp.subtract(n)

            scene.view.prp = n3
            scene.view.srp = n4
            break;
        case 87: // W key
            console.log("W");
            let n1 = calcN(scene.view.prp, scene.view.srp, scene.view.vup);
            let n0 = scene.view.prp.add(n1)
            let n2 = scene.view.srp.add(n1)

            scene.view.prp = n0
            scene.view.srp = n2
            break;
    }
    drawScene();
}

///////////////////////////////////////////////////////////////////////////
// No need to edit functions beyond this point
///////////////////////////////////////////////////////////////////////////

// Called when user selects a new scene JSON file
    function loadNewScene() {
        console.log("CALL: loadNewScene()")
        let scene_file = document.getElementById('scene_file');

        console.log(scene_file.files[0]);

        let reader = new FileReader();
        reader.onload = (event) => {
            scene = JSON.parse(event.target.result);
            scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);
            scene.view.srp = Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]);
            scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);

            for (let i = 0; i < scene.models.length; i++) {
                if (scene.models[i].type === 'generic') {
                    for (let j = 0; j < scene.models[i].vertices.length; j++) {
                        scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                            scene.models[i].vertices[j][1],
                            scene.models[i].vertices[j][2],
                            1);
                    }
                } else {
                    scene.models[i].center = Vector4(scene.models[i].center[0],
                        scene.models[i].center[1],
                        scene.models[i].center[2],
                        1);
                }
                scene.models[i].matrix = new Matrix(4, 4);
            }
            drawScene()
        };
        reader.readAsText(scene_file.files[0], 'UTF-8');
    }

// Draw black 2D line with red endpoints 
    function drawLine(x1, y1, x2, y2) {
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
        ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
    }