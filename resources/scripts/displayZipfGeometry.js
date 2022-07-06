'use strict';

// 2D Fourier Frequency Animation ///////////////////////////////////////////////////////

var freq2dCanvas = document.getElementById('freq2dCanvas');
var freq2dScene = new THREE.Scene();
var freq2dRenderer = new THREE.WebGLRenderer({canvas: freq2dCanvas, antialias: false});
var freq2dCamera = new THREE.PerspectiveCamera(45, freq2dCanvas.clientWidth/freq2dCanvas.clientWidth, 1, 1000);

var freq2dRes = new THREE.Vector2(freq2dCanvas.clientWidth, freq2dCanvas.clientHeight);

var inpxFreq = document.getElementById('inpxFreq');
var inpyFreq = document.getElementById('inpyFreq');

var freqs2d = new THREE.Vector2(inpxFreq.value, inpyFreq.value);
inpxFreq.oninput = function () {
    freqs2d.x = this.value;
}
inpyFreq.oninput = function () {
    freqs2d.y = this.value;
}

var freq2dShader = new THREE.ShaderMaterial({
	vertexShader: document.getElementById('2d_vs').textContent,
	fragmentShader: document.getElementById('2d_fs').textContent,
	depthWrite: false,
	depthTest: false,
	uniforms: {
		res: { type: 'v2', value: freq2dRes },
		freqs: { type: 'v2', value: freqs2d }
	}
});

var freqQuad = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2),
	freq2dShader
);

freq2dScene.add(freqQuad);
freq2dCamera.position.z = 15;

// 1D Fourier Frequency Animation ///////////////////////////////////////////////////////
//*
var linePoints = 300

var freq1dCanvas = document.getElementById('freq1dCanvas');
var freq1dRes = new THREE.Vector2(freq1dCanvas.clientWidth, freq1dCanvas.clientHeight);

var freq1dScene = new THREE.Scene();
var freq1dRenderer = new THREE.WebGLRenderer({ canvas: freq1dCanvas, antialias: true, alpha: true });
freq1dRenderer.setSize(freq1dCanvas.clientWidth, freq1dCanvas.clientHeight);

var freq1dCamera = new THREE.OrthographicCamera(-0.6, 0.6, -0.5, 0.5, 1, 10);
freq1dCamera.position.z = -2
freq1dCamera.lookAt(new THREE.Vector3(0, 0, 0))

var freq1dGeometry = new THREE.BufferGeometry();
freq1dGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * linePoints), 3));
let posArray = freq1dGeometry.getAttribute('position').array;
for(let i = 0; i < linePoints; i++) {
	let x = (i - 0.5*linePoints)/linePoints;
	posArray[3*i] = x;
	posArray[3*i + 1] = 0.45*Math.sin(4*Math.PI*x);
	posArray[3*i + 2] = 0;
}

var lineMaterial = new THREE.ShaderMaterial({
	vertexShader: document.getElementById('1d_vs').textContent,
    fragmentShader: document.getElementById('1d_fs').textContent,
    //uniforms: {
	//    color: {
	//        type: 'v3',
	//        value: new THREE.Vector3(trajParams.curve.r, trajParams.curve.g, trajParams.curve.b)
	//    }
	//},
	depthWrite: false,
	depthTest: false,
	linewidth: 3,
	transparent: true
});

var freq1dLine = new THREE.Line(freq1dGeometry, lineMaterial);
freq1dScene.add(freq1dLine);

var inpFreq = document.getElementById('inpFreq');
inpFreq.oninput = function () {
	console.log('input touchy touchied')
	let posAttr = freq1dGeometry.getAttribute('position');
	let posArray = posAttr.array;
	for(let i = 0; i < linePoints; i++) {
		let x = (i - 0.5*linePoints)/linePoints;
		posArray[3*i + 1] = 0.45*Math.sin(2*this.value*Math.PI*x);
	}
	posAttr.needsUpdate = true;
}

		//*/


function render() {
    requestAnimationFrame(render);

    if(freq2dCanvas.width !== freq2dCanvas.clientWidth || freq2dCanvas.height !== freq2dCanvas.clientHeight) {
    	freq2dRenderer.setSize(freq2dCanvas.clientWidth, freq2dCanvas.clientHeight, false);
    	freq2dCamera.aspect = freq2dCanvas.clientWidth/freq2dCanvas.clientHeight;
    	freq2dCamera.updateProjectionMatrix();
    	freq2dRes = new THREE.Vector2(freq2dCanvas.clientWidth, freq2dCanvas.clientHeight);
    }

    if(freq1dCanvas.width !== freq1dCanvas.clientWidth || freq1dCanvas.height !== freq1dCanvas.clientHeight) {
  	    freq1dRenderer.setSize(freq1dCanvas.clientWidth, freq1dCanvas.clientHeight, false);
  	    freq1dCamera.aspect = freq1dCanvas.clientWidth/freq1dCanvas.clientHeight;
  	    freq1dCamera.updateProjectionMatrix();
  	    freq1dRes = new THREE.Vector2(freq1dCanvas.clientWidth, freq1dCanvas.clientHeight);
    }

    freq2dShader.uniforms['res'].value = freq2dRes;
    freq2dShader.uniforms['freqs'].value = freqs2d;

    freq2dRenderer.render(freq2dScene, freq2dCamera);
    freq1dRenderer.render(freq1dScene, freq1dCamera);

}

render();