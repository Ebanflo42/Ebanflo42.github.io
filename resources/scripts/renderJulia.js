'use strict';

var julCanvas = document.getElementById('julia');
var julScene = new THREE.Scene();
var julRenderer = new THREE.WebGLRenderer({canvas: julCanvas, antialias: false});
var julCamera = new THREE.PerspectiveCamera(45, julCanvas.clientWidth/julCanvas.clientWidth, 1, 1000);

var julRes = new THREE.Vector2(julCanvas.clientWidth, julCanvas.clientHeight);

var julshader = new THREE.ShaderMaterial({
	vertexShader: document.getElementById('vs').textContent,
	fragmentShader: document.getElementById('jshader').textContent,
	depthWrite: false,
	depthTest: false,
	uniforms: {
		res: { type: 'v2', value: julRes },
		c: { type: 'v2', value: mouse }
	}
});

var julQuad = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2),
	julshader
);

julScene.add(julQuad);

julCamera.position.z = 15;

function render() {
  requestAnimationFrame(render);

  if(julCanvas.width !== julCanvas.clientWidth || julCanvas.height !== julCanvas.clientHeight) {
  	julRenderer.setSize(julCanvas.clientWidth, julCanvas.clientHeight, false);
  	julCamera.aspect = julCanvas.clientWidth/julCanvas.clientHeight;
  	julCamera.updateProjectionMatrix();
  	julRes = new THREE.Vector2(julCanvas.clientWidth, julCanvas.clientHeight);
  }

  julshader.uniforms['res'].value = julRes;
  julshader.uniforms['c'].value = mouse;

  if(manCanvas.width !== manCanvas.clientWidth || manCanvas.height !== manCanvas.clientHeight) {
  	manRenderer.setSize(manCanvas.clientWidth, manCanvas.clientHeight, false);
  	manCamera.aspect = manCanvas.clientWidth/manCanvas.clientHeight;
  	manCamera.updateProjectionMatrix();
  	manRes = new THREE.Vector2(manCanvas.clientWidth, manCanvas.clientHeight);
  }

  manshader.uniforms['res'].value = manRes;
  manshader.uniforms['m'].value = m;

  manRenderer.render(manScene, manCamera);
  julRenderer.render(julScene, julCamera);
}

render();