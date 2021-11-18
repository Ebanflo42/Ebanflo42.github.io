'use strict';

var cval = document.getElementById('cval');

var manCanvas = document.getElementById('mandelbrot');
var manScene = new THREE.Scene();
var manRenderer = new THREE.WebGLRenderer({canvas: manCanvas, antialias: false});
var manCamera = new THREE.PerspectiveCamera(45, manCanvas.clientWidth/manCanvas.clientWidth, 1, 1000);

var manRes = new THREE.Vector2(manCanvas.clientWidth, manCanvas.clientHeight);

var update = false;
var mouse = new THREE.Vector2(0, 0);
var m = new THREE.Vector2();

function readMouse(event){
	if(update){
	  var rect = manCanvas.getBoundingClientRect();
	  mouse = new THREE.Vector2(event.clientX - rect.left,
								rect.bottom - event.clientY);
		mouse.multiplyScalar(2.0);
		mouse.addScaledVector(manRes, -1);
		mouse.multiplyScalar(1.125/manRes.y);

		var real = '' + Math.abs(mouse.x);
		var imag = '' + Math.abs(mouse.y);
		cval.innerHTML = 'c = ' + (mouse.x < 0 ? '-' : '') + real.slice(0, 6) + (mouse.y < 0 ? ' - ' : ' + ') + imag.slice(0, 6) + 'i';

		m = mouse.clone();
	}
}

var manshader = new THREE.ShaderMaterial({
	vertexShader: document.getElementById('vs').textContent,
	fragmentShader: document.getElementById('mshader').textContent,
	depthWrite: false,
	depthTest: false,
	uniforms: {
		res: { type: 'v2', value: manRes },
		m: { type: 'v2', value: m }
	}
});

var manQuad = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2),
	manshader
);

manScene.add(manQuad);

manCamera.position.z = 15;