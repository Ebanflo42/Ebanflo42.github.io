'use strict';

var fourierCanvas = document.getElementById('fourieria');
var fourierScene = new THREE.Scene();
var fourierRenderer = new THREE.WebGLRenderer({canvas: fourierCanvas, antialias: false});
var fourierCamera = new THREE.PerspectiveCamera(45, fourierCanvas.clientWidth/fourierCanvas.clientWidth, 1, 1000);

var fourierRes = new THREE.Vector2(fourierCanvas.clientWidth, fourierCanvas.clientHeight);

var fouriershader = new THREE.ShaderMaterial({
	vertexShader: document.getElementById('vs').textContent,
	fragmentShader: document.getElementById('jshader').textContent,
	depthWrite: false,
	depthTest: false,
	uniforms: {
		res: { type: 'v2', value: fourierRes },
		c: { type: 'v2', value: mouse }
	}
});

var fourierQuad = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2),
	fouriershader
);

fourierScene.add(fourierQuad);

fourierCamera.position.z = 15;

function render() {
  requestAnimationFrame(render);

  if(fourierCanvas.width !== fourierCanvas.clientWidth || fourierCanvas.height !== fourierCanvas.clientHeight) {
  	fourierRenderer.setSize(fourierCanvas.clientWidth, fourierCanvas.clientHeight, false);
  	fourierCamera.aspect = fourierCanvas.clientWidth/fourierCanvas.clientHeight;
  	fourierCamera.updateProjectionMatrix();
  	fourierRes = new THREE.Vector2(fourierCanvas.clientWidth, fourierCanvas.clientHeight);
  }

  fouriershader.uniforms['res'].value = fourierRes;
  fouriershader.uniforms['c'].value = mouse;

}

render();