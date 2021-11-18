"use strict";

var paused = false;
var pauseBtn = document.getElementById("pause");
pauseBtn.onclick = function(){
  paused = !paused;
  pauseBtn.innerHTML = pauseBtn.innerHTML.replace(pauseBtn.innerHTML, paused ? "Unpause" : "Pause");
}

var mouse = new THREE.Vector2(0, 0);

function readMouse(event) {
	var canvas = document.getElementById("canvas");
	var rect = canvas.getBoundingClientRect();
	var scaleX = 1.0/rect.width;
	var scaleY = 1.0/rect.height;
	mouse = new THREE.Vector2((rect.left - event.clientX)*scaleX,
	                          (event.clientY - rect.bottom)*scaleY);
}

//normalize arbitrary-dimensional vector
function normalize(vector) {
  let magnitude = 0.0;
  let len = vector.length;

  for(let i = 0; i < len; i++)
    magnitude += vector[i]*vector[i];

  magnitude = Math.sqrt(magnitude);

  for(let i = 0; i < len; i++)
    vector[i] /= magnitude;
}

//multiply vector by matrix
function multiply(matrix, vector) {
  let dim = matrix.length;
  let len = vector.length;

  let result = new Float32Array(dim);

  for(let i = 0; i < dim; i++) {
    result[i] = 0.0;
    for(let j = 0; j < len; j++) result[i] += matrix[i][j]*vector[j];
  }

  return result;
}

//dot product, assume vectors have same length
function dot(u, v) {
  let result = 0;
  let iters = u.length;
  for(let i = 0; i < iters; i++)
    result += u[i]*v[i];
  return result;
}

//Gram-Schmidt orthonormalization
function gramSchmidt(vectors) {

  let dim = vectors.length;

  for(let i = 0; i < dim; i++) {
    for(let j = 0; j < i; j++) {
      let proj = dot(vectors[i], vectors[j]);
      for(let k = 0; k < dim; k++)
        vectors[i][k] -= proj*vectors[j][k];
    }
    normalize(vectors[i]);
  }
}

function getProjectionMatrix(dim, params) {

  //helper indices
  let d1 = dim - 1;
  let tdf = 2*dim - 4;
  let tdn = 3*dim - 9;

  //first components of the vector are inside the cube [-1,1]^(n-1)
  let vec1 = new Float32Array(dim);
  for(let i = 0; i < d1; i++)
    vec1[i] = params[i];

  //fold the cube into the bottom half of a cross-polytope
  let m = -1.0/0.0;
  for(let i = 0; i < d1; i++)
    m = Math.max(m, Math.abs(params[i]));
  vec1[d1] = 1 - m;

  //project onto sphere
  normalize(vec1);

  //vectors which are *hopefully* linearly independent with vec1
  let helpers = new Array();
  for(let i = 0; i < d1; i++) {
    let helper = new Float32Array(dim);
    for(let j = 0; j < d1; j++) {
      if(j == i) helper[j] = 1;
      else helper[j] = 0;
    }

    helper[d1] = -1;
    helpers.push(helper);
  }

  //get an orthonormal basis with vec1 in it
  let orthobasis = [vec1];
  let h1 = helpers.slice(0, d1);
  orthobasis = orthobasis.concat(h1);
  gramSchmidt(orthobasis);

  //construct the second vector
  let vec2 = new Float32Array(dim);

  if(d1 < tdf - 1) {
    for(let i = 0; i < dim; i++)
      vec2[i] = 0;

    //make vec2 a hypercube orthogonal to vec1
    for(let i = d1; i < tdf; i++) {
      for(let j = 0; j < dim; j++)
        vec2[j] += params[i]*orthobasis[i - d1 + 1][j];
    }

    //fold into cross-polytope
    m = -1.0/0.0;
    for(let i = d1; i < tdf; i++)
      m = Math.max(m, Math.abs(params[i]));
    m = 1 - m;
    for(let i = 0; i < dim; i++)
      vec2[i] += m*orthobasis[dim - 2][i];

    //project onto sphere
    normalize(vec2);
  }

  else vec2 = orthobasis[d1 - 1];

  //construct new orthonormal basis
  orthobasis = [vec1, vec2, orthobasis[d1]];
  let h2 = helpers.slice(0, d1 - 2);
  orthobasis = orthobasis.concat(h2);
  gramSchmidt(orthobasis);

  //construct the third vector
  let vec3 = new Float32Array(dim);

  if(tdf < tdn) {
    for(let i = 0; i < dim; i++)
      vec3[i] = 0;

    //make vec3 a hypercube orthogonal to vec1 and vec2
    for(let i = tdf; i < tdn; i++) {
      for(let j = 0; j < dim; j++)
        vec2[j] += params[i]*orthobasis[i - tdf + 3][j];
    }

    //fold into cross-polytope
    m = -1.0/0.0;
    for(let i = tdf; i < tdn; i++)
      m = Math.max(m, Math.abs(params[i]));
    m = 1 - m;
    for(let i = 0; i < dim; i++)
      vec3[i] += m*orthobasis[dim - 2][i];

    //project onto sphere
    normalize(vec3);
  }

  else vec3 = orthobasis[d1];

  //the projection matrix is a matrix whose rows form an orthonormal basis for the 3-plane
  return [vec1, vec2, vec3];
}

var projection = getProjectionMatrix(6, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
var orientationVars = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var clicked = false;

document.getElementById('orientation0').oninput = function() {
  clicked = true;
  let val = 0.001*this.value;
	orientationVars[0] = Math.sign(val)*(Math.pow(12, Math.abs(val)) - 1);
	projection = getProjectionMatrix(6, orientationVars);
}
document.getElementById('orientation1').oninput = function() {
  clicked = true;
  let val = 0.001*this.value;
	orientationVars[1] = Math.sign(val)*(Math.pow(12, Math.abs(val)) - 1);
	projection = getProjectionMatrix(6, orientationVars);
}
document.getElementById('orientation2').oninput = function() {
  clicked = true;
  let val = 0.001*this.value;
	orientationVars[2] = Math.sign(val)*(Math.pow(12, Math.abs(val)) - 1);
	projection = getProjectionMatrix(6, orientationVars);
}
document.getElementById('orientation3').oninput = function() {
  clicked = true;
  let val = 0.001*this.value;
	orientationVars[3] = Math.sign(val)*(Math.pow(12, Math.abs(val)) - 1);
	projection = getProjectionMatrix(6, orientationVars);
}
document.getElementById('orientation4').oninput = function() {
  clicked = true;
  let val = 0.001*this.value;
	orientationVars[4] = Math.sign(val)*(Math.pow(12, Math.abs(val)) - 1);
	projection = getProjectionMatrix(6, orientationVars);
}
document.getElementById('orientation5').oninput = function() {
  clicked = true;
  let val = 0.001*this.value;
	orientationVars[5] = Math.sign(val)*(Math.pow(12, Math.abs(val)) - 1);
	projection = getProjectionMatrix(6, orientationVars);
}
document.getElementById('orientation6').oninput = function() {
  clicked = true;
  let val = 0.001*this.value;
	orientationVars[6] = Math.sign(val)*(Math.pow(12, Math.abs(val)) - 1);
	projection = getProjectionMatrix(6, orientationVars);
}
document.getElementById('orientation7').oninput = function() {
  clicked = true;
  let val = 0.001*this.value;
	orientationVars[7] = Math.sign(val)*(Math.pow(12, Math.abs(val)) - 1);
	projection = getProjectionMatrix(6, orientationVars);
}
document.getElementById('orientation8').oninput = function() {
  clicked = true;
  let val = 0.001*this.value;
	orientationVars[8] = Math.sign(val)*(Math.pow(12, Math.abs(val)) - 1);
	projection = getProjectionMatrix(6, orientationVars);
}

var offsetInputElems = [];
var offsetVars = [0, 0, 0, 0, 0, 0];
document.getElementById('offset0').oninput = function() {
  clicked = true;
  let val = 0.01*this.value;
  offsetVars[0] = val;
}
document.getElementById('offset1').oninput = function() {
  clicked = true;
  let val = 0.01*this.value;
  offsetVars[1] = val;
}
document.getElementById('offset2').oninput = function() {
  clicked = true;
  let val = 0.01*this.value;
  offsetVars[2] = val;
}
document.getElementById('offset3').oninput = function() {
  clicked = true;
  let val = 0.01*this.value;
  offsetVars[3] = val;
}
document.getElementById('offset4').oninput = function() {
  clicked = true;
  let val = 0.01*this.value;
  offsetVars[4] = val;
}
document.getElementById('offset5').oninput = function() {
  clicked = true;
  let val = 0.01*this.value;
  offsetVars[5] = val;
}

var zoom = 3.0;
document.getElementById('zoom').oninput = function() {
  let val = 0.01*this.value;
  zoom = val;
}

var orientationPhases = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var orientationFreqs = [1, 1, 1, 1, 1, 1, 1, 1, 1];
var orientationAmps = [1, 1, 1, 1, 1, 1, 1, 1, 1];
for (var i = 0; i < 9; i++) {
  orientationPhases[i] = 6*Math.random();
  orientationFreqs[i] = Math.random();
  orientationAmps[i] = 0.25*Math.random();
}

var offsetPhases = [0, 0, 0, 0, 0, 0];
var offsetFreqs = [1, 1, 1, 1, 1, 1];
var offsetAmps = [1, 1, 1, 1, 1, 1];
for (var i = 0; i < 6; i++) {
  offsetPhases[i] = 6*Math.random();
  offsetFreqs[i] = Math.random();
  offsetAmps[i] = 0.75*Math.random();
}

var clock = new THREE.Clock();
clock.start();

var canvas = document.getElementById("canvas");
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
var camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientWidth, 1, 1000);
var clock = new THREE.Clock();
var resolution = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);
var shader = new THREE.ShaderMaterial({
	vertexShader: document.getElementById("vs").textContent,
	fragmentShader: document.getElementById("fs").textContent,
	depthWrite: false,
	depthTest: false,
	uniforms: {
		res: { type: "v2", value: resolution },
		m: { type: "v2", value: mouse },
		time: {type: "f", value: 0 },
		proj11: {type: "v3", value: THREE.Vector3(projection[0][0], projection[0][1], projection[0][2])},
		proj12: {type: "v3", value: THREE.Vector3(projection[0][3], projection[0][4], projection[0][5])},
		proj21: {type: "v3", value: THREE.Vector3(projection[1][0], projection[1][1], projection[1][2])},
		proj22: {type: "v3", value: THREE.Vector3(projection[1][3], projection[1][4], projection[1][5])},
		proj31: {type: "v3", value: THREE.Vector3(projection[2][0], projection[2][1], projection[2][2])},
		proj32: {type: "v3", value: THREE.Vector3(projection[2][3], projection[2][4], projection[2][5])},
		offset1: {type: "v3", value: THREE.Vector3(offsetVars[0], offsetVars[1], offsetVars[2])},
    offset2: {type: "v3", value: THREE.Vector3(offsetVars[3], offsetVars[4], offsetVars[5])},
    zoom: {type: "f", value: zoom}
	}
});

var quad = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2),
	shader
);
scene.add(quad);

camera.position.z = 10;

render();
function render() {

  if(!paused){
	  requestAnimationFrame(render);
	  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
	  	renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
	  	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	  	camera.updateProjectionMatrix();
	  	resolution = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);
	  }

    if (!clicked) {

      var t = clock.getElapsedTime();

      for (var i = 0; i < 6; i++) {
        offsetVars[i] = offsetAmps[i]*Math.sin(offsetFreqs[i]*t + offsetPhases[i]);
      }

      for (var i = 0; i < 9; i++) {
        orientationVars[i] = orientationAmps[i]*Math.sin(orientationFreqs[i]*i + orientationPhases[i]);
        projection = getProjectionMatrix(6, orientationVars);
      }
    }

	  shader.uniforms["res"].value = resolution;
	  shader.uniforms["m"].value = mouse;

    shader.uniforms["proj11"].value = new THREE.Vector3(projection[0][0], projection[0][1], projection[0][2]);
	  shader.uniforms["proj12"].value = new THREE.Vector3(projection[0][3], projection[0][4], projection[0][5]);
	  shader.uniforms["proj21"].value = new THREE.Vector3(projection[1][0], projection[1][1], projection[1][2]);
	  shader.uniforms["proj22"].value = new THREE.Vector3(projection[1][3], projection[1][4], projection[1][5]);
	  shader.uniforms["proj31"].value = new THREE.Vector3(projection[2][0], projection[2][1], projection[2][2]);
    shader.uniforms["proj32"].value = new THREE.Vector3(projection[2][3], projection[2][4], projection[2][5]);

	  shader.uniforms["offset1"].value = new THREE.Vector3(offsetVars[0], offsetVars[1], offsetVars[2]);
    shader.uniforms["offset2"].value = new THREE.Vector3(offsetVars[3], offsetVars[4], offsetVars[5]);

    shader.uniforms["zoom"].value = zoom

	  renderer.render(scene, camera);
  }
  else{
    requestAnimationFrame(renderPaused);
    renderer.render(scene, camera);
  }
}

function renderPaused(){
  if(paused) requestAnimationFrame(renderPaused);
  else {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}
