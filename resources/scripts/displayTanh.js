'use strict';

var angleInput = document.getElementById('angle');
var scaleInput = document.getElementById('scale');

var angle = 1;
var scale = 1.5;

var notrendered = true;

angleInput.oninput = function(){
    angle = 0.01*this.value;
    val1.innerHTML = val1.innerHTML.replace(val1.innerHTML, "Angle = " + angle).substring(0,20);
    notrendered = true;
  }

scaleInput.oninput = function(){
    scale = 0.5 + 0.01*this.value;
    val2.innerHTML = val2.innerHTML.replace(val2.innerHTML, "Scale = " + scale).substring(0,20);
    notrendered = true;
}

var canvas = document.getElementById('tanh');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
var camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientWidth, 1, 1000);

var res = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);

var shader = new THREE.ShaderMaterial({
	vertexShader: document.getElementById('vs').textContent,
	fragmentShader: document.getElementById('fs').textContent,
	depthWrite: false,
	depthTest: false,
	uniforms: {
		res: { type: 'v2', value: res },
		angle: { type: 'f', value: angle },
        scale: { type: 'f', value: scale }
	}
});

var quad = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2),
	shader
);

scene.add(quad);

camera.position.z = 15;

function render() {
    if(notrendered) {
        requestAnimationFrame(render);

        if(canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
     	    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    	    camera.aspect = canvas.clientWidth/canvas.clientHeight;
    	    camera.updateProjectionMatrix();
    	    res = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);
        }

        shader.uniforms['res'].value = res;
        shader.uniforms['angle'].value = angle;
        shader.uniforms['scale'].value = scale;
        renderer.render(scene, camera);

        notrendered = false;
    }
    else {
        requestAnimationFrame(renderPaused);
    }
}

function renderPaused(){
    if(!notrendered) requestAnimationFrame(renderPaused);
    else {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
  }

render();