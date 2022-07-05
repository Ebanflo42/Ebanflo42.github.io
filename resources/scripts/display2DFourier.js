'use strict';

var fourierCanvas = document.getElementById('2dfourierCanvas');
var fourierScene = new THREE.Scene();
var fourierRenderer = new THREE.WebGLRenderer({canvas: fourierCanvas, antialias: false});
var fourierCamera = new THREE.PerspectiveCamera(45, fourierCanvas.clientWidth/fourierCanvas.clientWidth, 1, 1000);

var fourierRes = new THREE.Vector2(fourierCanvas.clientWidth, fourierCanvas.clientHeight);

var inp_xFreq = document.getElementById('freqx');
var inp_yFreq = document.getElementById('freqy');

var fourierFreqs = new THREE.Vector2(inp_xFreq.value, inp_yFreq.value);
inp_xFreq.oninput = function () {
    fourierFreqs.x = this.value;
}
inp_yFreq.oninput = function () {
    fourierFreqs.y = this.value;
}

var fouriershader = new THREE.ShaderMaterial({
	vertexShader: document.getElementById('vs').textContent,
	fragmentShader: document.getElementById('2dfouriershader').textContent,
	depthWrite: false,
	depthTest: false,
	uniforms: {
		res: { type: 'v2', value: fourierRes },
		freqs: { type: 'v2', value: fourierFreqs }
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
  fouriershader.uniforms['freqs'].value = fourierFreqs;

  fourierRenderer.render(fourierScene, fourierCamera);

}

render();