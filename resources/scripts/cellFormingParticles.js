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

var rtTexturePos = new THREE.WebGLRenderTarget( this.width, this.height, {
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: floatType,
    stencilBuffer: false,
    depthBuffer: false,
    generateMipmaps: false
});
var targets = [rtTexturePos, rtTexturePos.clone()];

var simulationShader = new THREE.ShaderMaterial({

    uniforms: {
		res: { type: "v2", value: resolution },
		m: { type: "v2", value: mouse },
    },

    vertexShader: document.getElementById('simulation_vert_shader').textContent,
    fragmentShader:  document.getElementById('simulation_frag_shader').textContent,
    side: THREE.DoubleSide

});
simulationShader.uniforms.tPositions.value = simulationTexture;

this.simulationShader.uniforms.tPositions.value = this.texture;

var rtScene = new THREE.Scene();
var rtCamera = new THREE.OrthographicCamera( -this.width / 2, this.width / 2, -this.height / 2, this.height / 2, -500, 1000 );
var rtQuad = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( this.width, this.height ),
    this.simulationShader
);
rtScene.add( this.rtQuad );
simulate( this.rtScene, this.rtCamera, this.rtTexturePos );

this.plane = new THREE.Mesh( new THREE.PlaneGeometry( 64, 64 ), new THREE.MeshBasicMaterial( { map: this.rtTexturePos, side: THREE.DoubleSide } ) );
//scene.add( this.plane );

simulate = function( time, delta ) {

	this.simulationShader.uniforms.timer.value = time;
	this.simulationShader.uniforms.delta.value = delta;

	this.simulationShader.uniforms.tPositions.value = this.targets[ this.targetPos ];
	this.targetPos = 1 - this.targetPos;
	this.renderer.render( this.rtScene, this.rtCamera, this.targets[ this.targetPos ] );

}

render();
function render() {

  if(!paused){
	  requestAnimationFrame(render);
	  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
	  	renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
	  	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	  	camera.updateProjectionMatrix();
	  	resolution = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);
	  }

    if (!clicked) {

      var t = clock.getElapsedTime();

      for (var i = 0; i < 6; i++) {
        offsetVars[i] = offsetAmps[i]*Math.sin(offsetFreqs[i]*t + offsetPhases[i]);
      }

      for (var i = 0; i < 9; i++) {
        orientationVars[i] = orientationAmps[i]*Math.sin(orientationFreqs[i]*i + orientationPhases[i]);
        projection = getProjectionMatrix(6, orientationVars);
      }
    }

	  shader.uniforms["res"].value = resolution;
	  shader.uniforms["m"].value = mouse;

    shader.uniforms["proj11"].value = new THREE.Vector3(projection[0][0], projection[0][1], projection[0][2]);
	  shader.uniforms["proj12"].value = new THREE.Vector3(projection[0][3], projection[0][4], projection[0][5]);
	  shader.uniforms["proj21"].value = new THREE.Vector3(projection[1][0], projection[1][1], projection[1][2]);
	  shader.uniforms["proj22"].value = new THREE.Vector3(projection[1][3], projection[1][4], projection[1][5]);
	  shader.uniforms["proj31"].value = new THREE.Vector3(projection[2][0], projection[2][1], projection[2][2]);
    shader.uniforms["proj32"].value = new THREE.Vector3(projection[2][3], projection[2][4], projection[2][5]);

	  shader.uniforms["offset1"].value = new THREE.Vector3(offsetVars[0], offsetVars[1], offsetVars[2]);
    shader.uniforms["offset2"].value = new THREE.Vector3(offsetVars[3], offsetVars[4], offsetVars[5]);

    shader.uniforms["zoom"].value = zoom

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
