"use strict";

var paused = false;
var pauseBtn = document.getElementById("pause");
pauseBtn.onclick = function(){
  paused = !paused;
  pauseBtn.innerHTML = pauseBtn.innerHTML.replace(pauseBtn.innerHTML, paused ? "Unpause" : "Pause");
}

function readMouse(event){
	var canvas = document.getElementById("canvas");
	var rect = canvas.getBoundingClientRect();
	var scaleX = 1.0/rect.width;
	var scaleY = 1.0/rect.height;
	mouse = new THREE.Vector4((rect.left - event.clientX)*scaleX,
	                          (event.clientY - rect.bottom)*scaleY - 300,
														 0, 0);
}

var A = -100;
var B = 0.5;

var Ainput = document.getElementById("A");
var Binput = document.getElementById("B");

var Aoutput = document.getElementById("AVal");
var Boutput = document.getElementById("BVal");

Ainput.oninput = function(){
	A = this.value;
	Aoutput.innerHTML = Aoutput.innerHTML.replace(Aoutput.innerHTML, "A = " + A).substring(0, 8);
}

Binput.oninput = function(){
	B = .05*this.value;
	Boutput.innerHTML = Boutput.innerHTML.replace(Boutput.innerHTML, "B = " + B).substring(0, 8);
}

var canvas = document.getElementById("canvas");
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
var camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientWidth, 1, 1000);
var clock = new THREE.Clock();
var resolution = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);
var channelResolution = new THREE.Vector3(128.0, 128.0, 0.0);
var mouse = new THREE.Vector4(0, 0, 0, 0);
var shader = new THREE.ShaderMaterial({
		vertexShader: document.getElementById("vs").textContent,
		fragmentShader: document.getElementById("fs").textContent,
		depthWrite: false,
		depthTest: false,
		uniforms: {
			res: { type: "v2", value: resolution },
			m: { type: "v4", value: mouse },
			time: {type: "f", value: 0 },
            A: {type: "f", value: A},
            B: {type: "f", value: B}
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
		resolution = new THREE.Vector3(canvas.clientWidth, canvas.clientHeight, 1.0);
	}
	shader.uniforms["res"].value = resolution;
	shader.uniforms["m"].value = mouse;
	shader.uniforms["time"].value = clock.getElapsedTime();
    shader.uniforms["A"].value = A;
    shader.uniforms["B"].value = B;
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
