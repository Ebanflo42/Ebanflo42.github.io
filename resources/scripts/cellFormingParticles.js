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

// position x, position y, velocity x, velocity y
var simulationData = new Float32Array(4096*4);
for(var i = 0; i < 4096; i++) {
    simulationData[4*i] = 1296*Math.random();
    simulationData[4*i + 1] = 720*Math.random();
    simulationData[4*i + 2] = 1e-2*(2*Math.random() - 1);
    simulationData[4*i + 3] = 1e-2*(2*Math.random() - 1);
}
var simulationTexture = new THREE.DataTexture(simulationData, 64, 64, THREE.RGBAFormat, THREE.FloatType);
simulationTexture.minFilter = THREE.NearestFilter;
simulationTexture.magFilter = THREE.NearestFilter;
simulationTexture.needsUpdate = true;

var rtTexturePos = new THREE.WebGLRenderTarget( 64, 64, {
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: floatType,
    stencilBuffer: false,
    depthBuffer: false,
    generateMipmaps: false
});
// I guess one is previous state the other is next time state?
var renderTargets = [rtTexturePos, rtTexturePos.clone()];
var currentRenderTarget = 0;

var simulationShader = new THREE.ShaderMaterial({
    // more uniforms go here
    uniforms: {
		res: { type: "v2", value: resolution },
		m: { type: "v2", value: mouse },
    simTexture: { type: "t", value: simulationTexture },
    renderTarget: { type: "t", value: null },
    },
    vertexShader: document.getElementById('simulation_vert_shader').textContent,
    fragmentShader:  document.getElementById('simulation_frag_shader').textContent,
    side: THREE.DoubleSide

});
simulationShader.uniforms.tPositions.value = simulationTexture;

simulationShader.uniforms.tPositions.value = texture;

var simulationScene = new THREE.Scene();
var simulationCamera = new THREE.OrthographicCamera(-32, 32, -32, 32, -500, 1000);
var simulationQuad = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( this.width, this.height ),
    simulationShader
);
simulationScene.add(simulationQuad);
var simulationRenderer = new THREE.WebGLRenderer({'antialias': false});

// stuff for actual graphics
var canvas = document.getElementById("canvas");
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
var camera = new THREE.OrthographicCamera(-canvas.clientWidth/2, canvas.clientWidth/2, -canvas.clientHeight/2, canvas.clientHeight/2, -500, 1000);

// for drawing particles
const geometry = new THREE.CircleGeometry(2, 16);
const material1 = new THREE.MeshBasicMaterial({'color': 0xff0000})
const material2 = new THREE.MeshBasicMaterial({'color': 0x00ff00})
const material3 = new THREE.MeshBasicMaterial({'color': 0x0000ff})
const material4 = new THREE.MeshBasicMaterial({'color': 0xffff00})
var particleMeshes = new Array();
for(var i = 0; i++; i < 1024) {
  particleMeshes.push(new THREE.Mesh(geometry, material1));
  scene.add(particleMeshes[particleMeshes.length - 1]);
}
for(var i = 0; i++; i < 1024) {
  particleMeshes.push(new THREE.Mesh(geometry, material2));
  scene.add(particleMeshes[particleMeshes.length - 1]);
}
for(var i = 0; i++; i < 1024) {
  particleMeshes.push(new THREE.Mesh(geometry, material3));
  scene.add(particleMeshes[particleMeshes.length - 1]);
}
for(var i = 0; i++; i < 1024) {
  particleMeshes.push(new THREE.Mesh(geometry, material4));
  scene.add(particleMeshes[particleMeshes.length - 1]);
}

render();

function render() {

  if(!paused){
	  requestAnimationFrame(render);

    simulationShader.uniforms.renderTarget.value = renderTargets[currentRenderTarget];
    currentRenderTarget = 1 - currentRenderTarget;
    simulationRenderer.render(simulationScene, simulationCamera, renderTargets[currentRenderTarget]);

    // update scene here

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
