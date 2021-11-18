'use strict';

function clone(v) { return new THREE.Vector3(v.x, v.y, v.z); }

var isqrt2 = Math.sqrt(0.5);

var vertices = [];
vertices.push(new THREE.Vector3(8.5, 0, -8.5*isqrt2));
vertices.push(new THREE.Vector3(-8.5, 0, -8.5*isqrt2));
vertices.push(new THREE.Vector3(0, -8.5, 8.5*isqrt2));
vertices.push(new THREE.Vector3(0, 8.5, 8.5*isqrt2));

var midpoints = [];
midpoints.push(new THREE.Vector3(0, 0, -isqrt2)); //1st and 2nd
midpoints.push(new THREE.Vector3(0.5, -0.5, 0)); //1st and 3rd
midpoints.push(new THREE.Vector3(0.5, 0.5, 0)); //1st and 4th
midpoints.push(new THREE.Vector3(0, 0, isqrt2)); //3rd and 4th
midpoints.push(new THREE.Vector3(-0.5, -0.5, 0)); //2nd and 3rd
midpoints.push(new THREE.Vector3(-0.5, 0.5, 0)); //2nd and 4th

var faceCenters = [];
faceCenters.push(new THREE.Vector3(0, -0.333, -0.333 * isqrt2)); //not 4th
faceCenters.push(new THREE.Vector3(0, 0.333, -0.333 * isqrt2)); //not 3rd
faceCenters.push(new THREE.Vector3(0.333, 0, 0.333 * isqrt2)); //not 2nd
faceCenters.push(new THREE.Vector3(-0.333, 0, 0.333 * isqrt2)); //not 1st

var canvas = document.getElementById('canvas');
var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
var controls = new THREE.OrbitControls(camera, canvas);
controls.rotateSpeed = 0.5;
camera.position.z = 6;
controls.update();

var tetrahedron = new THREE.ConvexGeometry(vertices);
var tetmaterial = new THREE.MeshBasicMaterial({
    color: 'rgb(228,228,228)',
    wireframeLinewidth: 1,
    wireframe: true
});
var wireframe = new THREE.Mesh(tetrahedron, tetmaterial);
scene.add(wireframe);

var redmat = new THREE.MeshBasicMaterial({
    color: 'rgb(228,24,120)',
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
});

var greenmat = new THREE.MeshBasicMaterial({
    color: 'rgb(24,228,120)',
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
});

var bluemat = new THREE.MeshBasicMaterial({
    color: 'rgb(24,120,228)',
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
});

var yellowmat = new THREE.MeshBasicMaterial({
    color: 'rgb(228,228,24)',
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
});

var cyanmat = new THREE.MeshBasicMaterial({
    color: 'rgb(24,228,228)',
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
});

var magentamat = new THREE.MeshBasicMaterial({
    color: 'rgb(228,24,228)',
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
});

var pl1 = new THREE.PolyhedronGeometry(
    [0, 0, 0, midpoints[0].x, midpoints[0].y, midpoints[0].z, faceCenters[0].x, faceCenters[0].y, faceCenters[0].z, faceCenters[1].x, faceCenters[1].y, faceCenters[1].z], [0, 2, 3, 1, 2, 3], 6, 0);
var pl2 = new THREE.PolyhedronGeometry(
    [0, 0, 0, midpoints[1].x, midpoints[1].y, midpoints[1].z, faceCenters[0].x, faceCenters[0].y, faceCenters[0].z, faceCenters[2].x, faceCenters[2].y, faceCenters[2].z], [0, 2, 3, 1, 2, 3], 6, 0);
var pl3 = new THREE.PolyhedronGeometry(
    [0, 0, 0, midpoints[2].x, midpoints[2].y, midpoints[2].z, faceCenters[2].x, faceCenters[2].y, faceCenters[2].z, faceCenters[1].x, faceCenters[1].y, faceCenters[1].z], [0, 2, 3, 1, 2, 3], 6, 0);
var pl4 = new THREE.PolyhedronGeometry(
    [0, 0, 0, midpoints[3].x, midpoints[3].y, midpoints[3].z, faceCenters[2].x, faceCenters[2].y, faceCenters[2].z, faceCenters[3].x, faceCenters[3].y, faceCenters[3].z], [0, 2, 3, 1, 2, 3], 6, 0);
var pl5 = new THREE.PolyhedronGeometry(
    [0, 0, 0, midpoints[4].x, midpoints[4].y, midpoints[4].z, faceCenters[0].x, faceCenters[0].y, faceCenters[0].z, faceCenters[3].x, faceCenters[3].y, faceCenters[3].z], [0, 2, 3, 1, 2, 3], 6, 0);
var pl6 = new THREE.PolyhedronGeometry(
    [0, 0, 0, midpoints[5].x, midpoints[5].y, midpoints[5].z, faceCenters[1].x, faceCenters[1].y, faceCenters[1].z, faceCenters[3].x, faceCenters[3].y, faceCenters[3].z], [0, 2, 3, 1, 2, 3], 6, 0);

var obj1 = new THREE.Mesh(pl1, redmat);
var obj2 = new THREE.Mesh(pl2, greenmat);
var obj3 = new THREE.Mesh(pl3, bluemat);
var obj4 = new THREE.Mesh(pl4, yellowmat);
var obj5 = new THREE.Mesh(pl5, cyanmat);
var obj6 = new THREE.Mesh(pl6, magentamat);

scene.add(obj1);
scene.add(obj2);
scene.add(obj3);
scene.add(obj4);
scene.add(obj5);
scene.add(obj6);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();