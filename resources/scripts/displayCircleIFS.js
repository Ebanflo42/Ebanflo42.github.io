"use strict";

var paused = true;
var pauseBtn = document.getElementById("pause");
pauseBtn.onclick = function(){
  paused = !paused;
  pauseBtn.innerHTML = pauseBtn.innerHTML.replace(pauseBtn.innerHTML, paused ? "Unpause Color" : "Pause Color");
}

var interactive = true;
function readMouse(event){
	if(interactive){
		var canvas = document.getElementById("canvas");
		var rect = canvas.getBoundingClientRect();
		var middle = [0.5*(rect.left + rect.right), 0.5*(rect.top + rect.bottom)];
		mouse = new THREE.Vector2((event.clientX - middle[0])/canvas.width, (middle[1] - event.clientY)/canvas.height);
	}
}

var canvas = document.getElementById("canvas");
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
var camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientWidth, 1, 1000);
var resolution = new THREE.Vector3(canvas.clientWidth, canvas.clientHeight, 1.0);
var channelResolution = new THREE.Vector3(128.0, 128.0, 0.0);
var mouse = new THREE.Vector4(0, 0, 0, 0);
var shader = new THREE.ShaderMaterial({
		vertexShader: document.getElementById("vs").textContent,
		fragmentShader: document.getElementById("fs").textContent,
		depthWrite: false,
		depthTest: false,
		uniforms: {
			res: { type: "v3", value: resolution },
			time: { type: "f", value: 7.5 },
			deltaTime: { type: "f", value: 0.0 },
			frame: { type: "i", value: 0 },
			mouse: { type: "v4", value: mouse },
		}
	});

var quad = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2),
	shader
);
scene.add(quad);
camera.position.z = 10;
render();
function render(){
	requestAnimationFrame(render);
	if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
		renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
		resolution = new THREE.Vector3(canvas.clientWidth, canvas.clientHeight, 1.0);
	}
	shader.uniforms["res"].value = resolution;
	if(!paused) shader.uniforms["time"].value += 0.0167;
	shader.uniforms["mouse"].value = mouse;
	renderer.render(scene, camera);
}