let view;
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
            type: 'perspective',
            prp: Vector3(44, 20, -16),
            srp: Vector3(20, 20, -40),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
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
            }
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
    // step 1: calculate time (time since start)
    let time = timestamp - start_time;
    
    // step 2: transform models based on time
    // TODO: implement this!

    // step 3: draw scene
    drawScene();

    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
    // window.requestAnimationFrame(animate);
}

// Main drawing code - use information contained in variable `scene`
function drawScene() {
    console.log("CALL: drawScene()")
    console.log("SCENE: ", scene);
    
    let Npar = mat4x4Parallel(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip)
    let Mpar = mat4x4MPar()
    let V = mat4x4V(view.width, view.height)

    for (let model of scene.models){
        for (let edge of model.edges){

            // an edge can have multiple lines, so we need to iterate through each vertex, two at a time
            for (let i = 0; i < edge.length - 1; i++) {
                let p1 = model.vertices[edge[i]]
                let p2 = model.vertices[edge[i+1]]

                // // multiply by Npar
                p1 = Npar.mult(p1)
                p2 = Npar.mult(p2)

                // clip in 3D
                let line = clipLineParallel({ p0: p1, p1: p2 })

                // clipLineParallel() can return null, so we need to check
                if (line !== null) {

                    // project to 2D
                    p1 = Mpar.mult(line.p0)
                    p2 = Mpar.mult(line.p1)

                    // todo vertices are a bit outside the range [-1, 1] at this point in the code

                    // translate to make new range [0, 2]
                    // convert back to vector (mult() returns a 4x4 matrix)
                    p1 = vector4FromArray(p1.data)
                    p2 = vector4FromArray(p2.data)
                    p1.x += 1
                    p1.y += 1
                    p2.x += 1
                    p2.y += 1

                    // scale to window
                    p1 = V.mult(p1)
                    p2 = V.mult(p2)

                    // convert back to vector (mult() returns a 4x4 matrix)
                    p1 = vector4FromArray(p1.data)
                    p2 = vector4FromArray(p2.data)

                    // draw line
                    drawLine(p1.x, p1.y, p2.x, p2.y)
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
            scalar = scalar * 0.1
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            scalar = scalar * 1.1
            break;
        case 65: // A key
            console.log("A");
            break;
        case 68: // D key
            console.log("D");
            break;
        case 83: // S key
            console.log("S");
            break;
        case 87: // W key
            console.log("W");
            break;
    }
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