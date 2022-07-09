'use strict';

// 2D Fourier Frequency Animation /////////////////////////////////////////////

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

// 1D Fourier Frequency Animation /////////////////////////////////////////////


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
freq1dGeometry.setAttribute('position',
							new THREE.BufferAttribute(new Float32Array(3 * linePoints), 3));
let freq1dPosArray = freq1dGeometry.getAttribute('position').array;
for(let i = 0; i < linePoints; i++) {
	let x = (i - 0.5*(linePoints - 1))/(linePoints - 1);
	freq1dPosArray[3*i] = x;
	freq1dPosArray[3*i + 1] = 0.45*Math.sin(4*Math.PI*x);
	freq1dPosArray[3*i + 2] = 0;
}

var lineMaterial = new THREE.ShaderMaterial({
	vertexShader: document.getElementById('1d_vs').textContent,
    fragmentShader: document.getElementById('1d_fs').textContent,
	depthWrite: false,
	depthTest: false,
	linewidth: 3,
	transparent: true
});

var freq1dLine = new THREE.Line(freq1dGeometry, lineMaterial);
freq1dScene.add(freq1dLine);

var inpFreq = document.getElementById('inpFreq');
inpFreq.oninput = function () {
	let posAttr = freq1dGeometry.getAttribute('position');
	let freq1dPosArray = posAttr.array;
	for(let i = 0; i < linePoints; i++) {
		let x = (i - 0.5*(linePoints - 1))/(linePoints - 1);
		freq1dPosArray[3*i + 1] = 0.45*Math.sin(2*this.value*Math.PI*x);
	}
	posAttr.needsUpdate = true;
}


// High Dimensional Projection ////////////////////////////////////////////////

var highdLinePoints = 3600;

//*
var axis1 = new Array();
for(let i = 0; i < 300; i++) {
	axis1.push(Math.random());
}
var norm = 0;
for(let i = 0; i < 300; i++) {
	norm += axis1[i]*axis1[i];
}
for(let i = 0; i < 300; i++) {
	axis1[i] /= Math.sqrt(norm);
}
// super dumb way to create orthogonal vectors
var axis2 = new Array();
for(let i = 0; i < 150; i++) {
	axis2.push(axis1[2*i + 1]);
	axis2.push(-axis1[2*i]);
}
var axis3 = new Array();
for(let i = 0; i < 100; i++) {
	axis3.push(axis1[3*i + 1]*axis2[3*i + 2] - axis1[3*i + 2]*axis2[3*i + 1]);
	axis3.push(axis1[3*i]*axis2[3*i + 2] - axis1[3*i + 2]*axis2[3*i]);
	axis3.push(axis1[3*i]*axis2[3*i + 1] - axis1[3*i + 1]*axis2[3*i]);
}
norm = 0;
for(let i = 0; i < 300; i++) {
	norm += axis3[i]*axis3[i];
}
for(let i = 0; i < 300; i++) {
	axis3[i] /= Math.sqrt(norm);
}

var phases = new Array();
for(let i = 0; i < 300; i++) {
	phases.push(Math.PI*Math.random());
}
var exponent = -1;
var powerNormalizer = 0;
for(let i = 0; i < 300; i++) {
	powerNormalizer += Math.pow(i + 1, exponent);
}

var highdPoints = new Array();
for(let i = 0; i < highdLinePoints + 1; i++) {
	let point = new Array();
	for(let j = 0; j < 300; j++) {
		let wav = Math.sin(2*Math.PI*(j + 1)*i/highdLinePoints + phases[j]);
		let amp = Math.pow(j + 1, exponent)/powerNormalizer;
		point.push(amp*wav);
	}
	//*/
	highdPoints.push(point)
}

var highdCanvas = document.getElementById('highdCanvas');
var highdCamera = new THREE.PerspectiveCamera(60, highdCanvas.clientWidth / highdCanvas.clientHeight, 0.01, 20);
var cameraControl = new THREE.OrbitControls(highdCamera, highdCanvas);
highdCamera.position.set(0, 0, 0.05);
highdCamera.lookAt(new THREE.Vector3(0, 0, 0));

var highdGeometry = new THREE.BufferGeometry();
highdGeometry.setAttribute('position',
						    new THREE.BufferAttribute(new Float32Array(3 * (highdLinePoints + 1)), 3));
var highdPosArray = highdGeometry.getAttribute('position').array;
for(let i = 0; i < highdLinePoints + 1; i++) {
	highdPosArray[3*i] = 0;
	highdPosArray[3*i + 1] = 0;
	highdPosArray[3*i + 2] = 0;
	for(let j = 0; j < 300; j++) {
		highdPosArray[3*i] += axis1[j]*highdPoints[i][j];
		highdPosArray[3*i + 1] += axis2[j]*highdPoints[i][j];
		highdPosArray[3*i + 2] += axis3[j]*highdPoints[i][j];
	}
}

let vertCol = new Float32Array(3*(highdLinePoints + 1));
for (let i = 0; i < highdLinePoints + 1; i++) {
	vertCol[3*i] = 0.5 + 0.5*Math.sin(2*Math.PI*i/highdLinePoints);
	vertCol[3*i + 1] = 0.5 + 0.5*Math.sin(2*Math.PI*i/highdLinePoints + 0.333*Math.PI);
	vertCol[3*i + 2] = 0.5 + 0.5*Math.sin(2*Math.PI*i/highdLinePoints + 0.66*Math.PI);
}
highdGeometry.setAttribute('vertCol', new THREE.BufferAttribute(vertCol, 3));
highdGeometry.setDrawRange(0, highdLinePoints + 1);

var highdMaterial = new THREE.ShaderMaterial({
	vertexShader: document.getElementById('highd_vs').textContent,
	fragmentShader: document.getElementById('highd_fs').textContent,
	uniforms: {p: {type: 'f', value: exponent}},
	depthWrite: false,
	depthTest: false,
	linewidth: 2,
	transparent: true
});

var highdScene = new THREE.Scene();
var highdLine = new THREE.Line(highdGeometry, highdMaterial);
highdScene.add(highdLine);

var highdRenderer = new THREE.WebGLRenderer({ canvas: highdCanvas, antialias: true, alpha: false });
highdRenderer.setSize(highdCanvas.clientWidth, highdCanvas.clientHeight);

var expInput = document.getElementById("expInput");
expInput.oninput = function() {

	exponent = -this.value/20;
	powerNormalizer = 0;
	for(let i = 0; i < 300; i++) {
		powerNormalizer += Math.pow(i + 1, exponent);
	}


	for(let i = 0; i < highdLinePoints + 1; i++) {
		for(let j = 0; j < 300; j++) {
			let wav = Math.sin(2*Math.PI*(j + 1)*i/highdLinePoints + phases[j]);
			let amp = Math.pow(j + 1, exponent)/powerNormalizer;
			highdPoints[i][j] = amp*wav;
		}
	}

	let posAttr = highdGeometry.getAttribute('position');
	let posArray = posAttr.array;
	for(let i = 0; i < highdLinePoints + 1; i++) {
		posArray[3*i] = 0;
		posArray[3*i + 1] = 0;
		posArray[3*i + 2] = 0;
		for(let j = 0; j < 300; j++) {
			posArray[3*i] += axis1[j]*highdPoints[i][j];
			posArray[3*i + 1] += axis2[j]*highdPoints[i][j];
			posArray[3*i + 2] += axis3[j]*highdPoints[i][j];
		}
	}
	posAttr.needsUpdate = true;
}


// Rendering //////////////////////////////////////////////////////////////////


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

    if(highdCanvas.width !== highdCanvas.clientWidth || highdCanvas.height !== highdCanvas.clientHeight) {
		highdRenderer.setSize(highdCanvas.clientWidth, highdCanvas.clientHeight, false);
		highdCamera.aspect = highdCanvas.clientWidth/highdCanvas.clientHeight;
		highdCamera.updateProjectionMatrix();
		highdRes = new THREE.Vector2(highdCanvas.clientWidth, highdCanvas.clientHeight);
  }

    freq2dShader.uniforms['res'].value = freq2dRes;
    freq2dShader.uniforms['freqs'].value = freqs2d;

	highdMaterial.uniforms['p'].value = exponent;

    freq2dRenderer.render(freq2dScene, freq2dCamera);
    freq1dRenderer.render(freq1dScene, freq1dCamera);
	highdRenderer.render(highdScene, highdCamera);

}

render();