'use strict';

var phi = 0.5*(1.0+Math.sqrt(5));

var points = [];

points.push(new THREE.Vector3(   0,    1,  phi));//
points.push(new THREE.Vector3(   0,   -1,  phi));//
points.push(new THREE.Vector3(   0,   -1, -phi));
points.push(new THREE.Vector3(   0,    1, -phi));
points.push(new THREE.Vector3( phi,    0,    1));//
points.push(new THREE.Vector3( phi,    0,   -1));
points.push(new THREE.Vector3(-phi,    0,   -1));
points.push(new THREE.Vector3(-phi,    0,    1));
points.push(new THREE.Vector3(   1,  phi,    0));//
points.push(new THREE.Vector3(  -1,  phi,    0));
points.push(new THREE.Vector3(  -1, -phi,    0));
points.push(new THREE.Vector3(   1, -phi,    0));
points.push(new THREE.Vector3(0.1, 0.1, 0.1));//inside point to be adjusted by slider

var helper = [points[0], points[1], points[4], points[8]];//points to be adjusted by slider

var canvas = document.getElementById('canvas');
var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
var controls = new THREE.OrbitControls(camera, canvas);
controls.rotateSpeed = 0.5;
camera.position.z = 6;
controls.update();

var geometry = new THREE.ConvexGeometry(points);

var material = new THREE.MeshLambertMaterial();
material.color = new THREE.Color('rgb(96,224,128)');
material.emissive = new THREE.Color('rgb(12,53,16)');
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

var pos = camera.position;
var light1 = new THREE.PointLight(0xffff00, 1, 100);
light1.position.set(8, 8, 8);
scene.add(light1);
var light2 = new THREE.PointLight(0xff00ff, 1, 100);
light2.position.set(8, 8, 0);
scene.add(light2);
var light3 = new THREE.PointLight(0x00ffff, 1, 100);
light3.position.set(-16, 4, 0);
scene.add(light3);
var light4 = new THREE.PointLight(0x0000ff, 1, 100);
light4.position.set(8, -8, 0);
scene.add(light4);

let single = document.getElementById('single');
single.oninput = function() {

  let val = 0.5 + 0.01*single.value;
  points[12] = new THREE.Vector3(val, val, val);

  geometry.dispose();
  geometry = new THREE.ConvexGeometry(points);
  mesh.geometry = geometry;
}

let double = document.getElementById('double');
double.oninput = function() {
  
  let val1 = 1.0 + 0.01*double.value;
  let val2 = 1.0 - 0.01*double.value;
  points[1] = new THREE.Vector3(val2*helper[1].x, val2*helper[1].y, val2*helper[1].z);
  points[0] = new THREE.Vector3(val1*helper[0].x, val1*helper[0].y, val1*helper[0].z);
  points[4] = new THREE.Vector3(val1*helper[2].x, val1*helper[2].y, val1*helper[2].z);
  points[8] = new THREE.Vector3(val2*helper[3].x, val2*helper[3].y, val2*helper[3].z);

  geometry.dispose();
  geometry = new THREE.ConvexGeometry(points);
  mesh.geometry = geometry;
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();