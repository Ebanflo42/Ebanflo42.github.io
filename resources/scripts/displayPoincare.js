"use strict";

var canvas = document.getElementById("canvas");
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, programCheckEnabled: true });
var camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientWidth, 1, 1555);
var resolution = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);
var mouse = new THREE.Vector2(0, 0);

var arcPos = [new THREE.Vector4(0, 0.9, 0.9, 0), new THREE.Vector4(0, -0.9, -0.9, 0), new THREE.Vector4(0.45, -0.78, 0.78, -0.45), new THREE.Vector4(-0.45, 0.78, -0.78, 0.45)];
var center = [new THREE.Vector2(0, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 0)];
var rad = [0, 0, 0, 0];

function mulInverse(vector, a, b, c, d) {
    var det = ad - bc;
    var x = (d*v.x - b*v.x)/det;
    var y = (-c*v.x + a*v.y)/det;
    return new THREE.Vector2(x, y);
}

//may have prematurely optimized, watch out!
function computeOrthoCircles() {

    for(var i = 0; i < 4; i++) {

        var c = -0.81;

        var p1 = new THREE.Vector2(arcPos[i].x, arcPos[i].y);
        var p2 = new THREE.Vector2(arcPos[i].z, arcPos[i].w);

        var A = new THREE.Matrix3();
        A.set(-2.0*p1.x, -2.0*p2.x, 0,  -2.0*p1.y, -2.0*p2.y, 0, 0, 0, 1);
        A.transpose();
        var v = new THREE.Vector3(c - p1.x*p1.x - p1.y*p1.y, c - p2.x*p2.x - p2.y*p2.y, 0);
        var invA = new THREE.Matrix3();
        invA.getInverse(A);
        v.applyMatrix3(invA);

        var r = Math.sqrt(c + v.x*v.x + v.y*v.y);

        rad[i] = r;
        center[i] = new THREE.Vector2(v.x, v.y);
    }

}

computeOrthoCircles()

var mouseDown = false;
var mouseNear = [false, false, false, false]

function reactToMouse() {

    for(var i = 0; i < 4; i++) {
        var d1 = mouse.distanceTo(new THREE.Vector2(arcPos[i].x, arcPos[i].y))
        var d2 = mouse.distanceTo(new THREE.Vector2(arcPos[i].z, arcPos[i].w))
        if(d1 > 0.1 && d2 > 0.1) {
            mouseNear[i] = false;
        }
    }

    for(var i = 0; i < 4; i++) {
        var d1 = mouse.distanceTo(new THREE.Vector2(arcPos[i].x, arcPos[i].y))
        var d2 = mouse.distanceTo(new THREE.Vector2(arcPos[i].z, arcPos[i].w))
        if(d1 < 0.1 || d2 < 0.1) {
            mouseNear[i] = true;
            break;
        }
    }

    if(mouseNear[0]) {

        var d1 = mouse.distanceTo(new THREE.Vector2(arcPos[0].x, arcPos[0].y))
        var d2 = mouse.distanceTo(new THREE.Vector2(arcPos[0].z, arcPos[0].w))

        if(d1 < 0.1) {
            var p = mouse.clone();
            p.normalize();
            p.multiplyScalar(0.9);
            arcPos[0] = new THREE.Vector4(p.x, p.y, arcPos[0].z, arcPos[0].w);
        }
        else if(d2 < 0.1) {
            var p = mouse.clone();
            p.normalize();
            p.multiplyScalar(0.9);
            arcPos[0] = new THREE.Vector4(arcPos[0].x, arcPos[0].y, p.x, p.y);
        }

    }
    else if(mouseNear[1]) {

        var d1 = mouse.distanceTo(new THREE.Vector2(arcPos[1].x, arcPos[1].y))
        var d2 = mouse.distanceTo(new THREE.Vector2(arcPos[1].z, arcPos[1].w))

        if(d1 < 0.1) {
            var p = mouse.clone();
            p.normalize();
            p.multiplyScalar(0.9);
            arcPos[1] = new THREE.Vector4(p.x, p.y, arcPos[1].z, arcPos[1].w);
        }
        else if(d2 < 0.1) {
            var p = mouse.clone();
            p.normalize();
            p.multiplyScalar(0.9);
            arcPos[1] = new THREE.Vector4(arcPos[1].x, arcPos[1].y, p.x, p.y);
        }

    }
    else if(mouseNear[2]) {

        var d1 = mouse.distanceTo(new THREE.Vector2(arcPos[2].x, arcPos[2].y))
        var d2 = mouse.distanceTo(new THREE.Vector2(arcPos[2].z, arcPos[2].w))

        if(d1 < 0.1) {
            var p = mouse.clone();
            p.normalize();
            p.multiplyScalar(0.9);
            arcPos[2] = new THREE.Vector4(p.x, p.y, arcPos[2].z, arcPos[2].w);
        }
        else if(d2 < 0.1) {
            var p = mouse.clone();
            p.normalize();
            p.multiplyScalar(0.9);
            arcPos[2] = new THREE.Vector4(arcPos[2].x, arcPos[2].y, p.x, p.y);
        }

    }
    else if(mouseNear[3]) {

        var d1 = mouse.distanceTo(new THREE.Vector2(arcPos[3].x, arcPos[3].y))
        var d2 = mouse.distanceTo(new THREE.Vector2(arcPos[3].z, arcPos[3].w))

        if(d1 < 0.1) {
            var p = mouse.clone();
            p.normalize();
            p.multiplyScalar(0.9);
            arcPos[3] = new THREE.Vector4(p.x, p.y, arcPos[3].z, arcPos[3].w);
        }
        else if(d2 < 0.1) {
            var p = mouse.clone();
            p.normalize();
            p.multiplyScalar(0.9);
            arcPos[3] = new THREE.Vector4(arcPos[3].x, arcPos[3].y, p.x, p.y);
        }

    }

    computeOrthoCircles();

}

function readMouse(event) {

    var canvas = document.getElementById("canvas");
    var rect = canvas.getBoundingClientRect();
    var scaleY = 1.0 / rect.height;
    var actualX = event.clientX - 700;
    var actualY = event.clientY - 50;
    mouse = new THREE.Vector2((2.0*actualX - rect.left) * scaleY,
        (rect.bottom - 2.0*actualY) * scaleY);

    if(mouseDown)
        reactToMouse();
}

var shader = new THREE.ShaderMaterial({
    vertexShader: document.getElementById("vs").textContent,
    fragmentShader: document.getElementById("fs").textContent,
    depthWrite: false,
    depthTest: false,
    uniforms: {
        res: { type: "v2", value: resolution },
        m: { type: "v2", value: mouse },
        arcPos1: { type: "v4", value: arcPos[0] },
        arcPos2: { type: "v4", value: arcPos[1] },
        arcPos3: { type: "v4", value: arcPos[2] },
        arcPos4: { type: "v4", value: arcPos[3] },
        r1: { type: "f", value: rad[0]},
        r2: { type: "f", value: rad[1]},
        r3: { type: "f", value: rad[2]},
        r4: { type: "f", value: rad[3]},
        c1: {type: "v2", value: center[0]},
        c2: {type: "v2", value: center[1]},
        c3: {type: "v2", value: center[2]},
        c4: {type: "v2", value: center[3]}
    }
});

var quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    shader
);
scene.add(quad);
camera.position.z = 15;
render();

function render() {

    requestAnimationFrame(render);

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        resolution = new THREE.Vector3(canvas.clientWidth, canvas.clientHeight, 1.5);
    }

    shader.uniforms["res"].value = resolution;
    shader.uniforms["m"].value = mouse;

    shader.uniforms["arcPos1"].value = arcPos[0];
    shader.uniforms["arcPos2"].value = arcPos[1];
    shader.uniforms["arcPos3"].value = arcPos[2];
    shader.uniforms["arcPos4"].value = arcPos[3];

    shader.uniforms["r1"].value = rad[0];
    shader.uniforms["r2"].value = rad[1];
    shader.uniforms["r3"].value = rad[2];
    shader.uniforms["r4"].value = rad[3];

    shader.uniforms["c1"].value = center[0];
    shader.uniforms["c2"].value = center[1];
    shader.uniforms["c3"].value = center[2];
    shader.uniforms["c4"].value = center[3];

    renderer.render(scene, camera);

}