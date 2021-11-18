"use strict";

var input1 = document.getElementById("velocity1");
var input2 = document.getElementById("velocity2");
var input3 = document.getElementById("velocity3");
var input4 = document.getElementById("velocity4");

var button1 = document.getElementById("octaplex");
var button2 = document.getElementById("orthoplex");
var button3 = document.getElementById("tesseract");

var mode = 0;

var velocity1 = 0.1;
var velocity2 = 0.2;
var velocity3 = 0.3;
var velocity4 = 0.4;

var val1 = document.getElementById("val1");
var val2 = document.getElementById("val2");
var val3 = document.getElementById("val3");
var val4 = document.getElementById("val4");

input1.oninput = function(){
  velocity1 = 0.1*this.value;
  val1.innerHTML = val1.innerHTML.replace(val1.innerHTML, "Velocity 1: " + velocity1).substring(0,16);
}

input2.oninput = function(){
  velocity2 = 0.1*this.value;
  val2.innerHTML = val2.innerHTML.replace(val2.innerHTML, "Velocity 2: " + velocity2).substring(0,16);
}

input3.oninput = function(){
  velocity3 = 0.1*this.value;
  val3.innerHTML = val3.innerHTML.replace(val3.innerHTML, "Velocity 3: " + velocity3).substring(0,16);
}

input4.oninput = function(){
  velocity4 = 0.1*this.value;
  val4.innerHTML = val4.innerHTML.replace(val4.innerHTML, "Velocity 4: " + velocity4).substring(0,16);
}

button1.onclick = function(){mode = 0;}
button2.onclick = function(){mode = 2;}
button3.onclick = function(){mode = 1;}

var paused = true;
var pauseBtn = document.getElementById("pause");
pauseBtn.onclick = function(){
  paused = !paused;
  pauseBtn.innerHTML = pauseBtn.innerHTML.replace(pauseBtn.innerHTML, paused ? "Play" : "Pause");
}


var interactive = true;
function readMouse(event){
  if(interactive){
	  var canvas = document.getElementById("canvas");
	  var rect = canvas.getBoundingClientRect();
	  var scaleX = 2.0/rect.width;
	  var scaleY = 2.0/rect.height;
	  mouse = new THREE.Vector2((rect.left - event.clientX)*scaleX,
                              (event.clientY - rect.bottom)*scaleY);
  }
}

function c(x){return Math.cos(x);}
function s(x){return Math.sin(x);}

function makeMatrix(wx, wy, wz, xy, xz, yz){
    var cwx = c(wx), swx = s(wx);
    var rwx = new THREE.Matrix4();
    rwx.set( cwx, swx, 0, 0,
            -swx, cwx, 0, 0,
               0,   0, 1, 0,
               0,   0, 0, 1);

    var cwy = c(wy), swy = s(wy);
    var rwy = new THREE.Matrix4();
    rwy.set( cwy, 0,  swy, 0,
               0, 1,    0, 0,
            -swy,  0, cwy, 0,
                0, 0,   0, 1);

    var cwz = c(wz), swz = s(wz);
    var rwz = new THREE.Matrix4();
    rwz.set( cwz, 0, 0, swz,
               0, 1, 0,   0,
               0, 0, 1,   0,
            -swz, 0, 0, cwz);

    var cxy = c(xy), sxy = s(xy);
    var rxy = new THREE.Matrix4();
    rxy.set( 1,    0,   0, 0,
             0,  cxy, sxy, 0,
             0, -sxy, cxy, 0,
             0,    0,   0, 1);

    var cxz = c(xz), sxz = s(xz);
    var rxz = new THREE.Matrix4();
    rxz.set( 1,    0,  0,   0,
             0,  cxz,  0, sxz,
             0,    0,  1,   0,
             0, -sxz,  0, cxz);

    var cyz = c(yz), syz = s(yz);
    var ryz = new THREE.Matrix4();
    ryz.set(1,  0,     0,   0, 
            0,  1,     0,   0,
            0,  0,   cyz, syz,
            0,  0,  -syz, cyz);

    return rwx.multiply(rwy).multiply(rwz).multiply(rxy).multiply(rxz).multiply(ryz);
}

var canvas = document.getElementById("canvas");
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
var camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientWidth, 1, 1555);
var clock = new THREE.Clock();
var resolution = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);
var channelResolution = new THREE.Vector3(128.5, 128.5, 5.5);
var mouse = new THREE.Vector2(0, 0);

var shader = new THREE.ShaderMaterial({
		vertexShader: document.getElementById("vs").textContent,
		fragmentShader: document.getElementById("fs").textContent,
		depthWrite: false,
		depthTest: false,
		uniforms: {
			res: {type: "v2", value: resolution},
			m: {type: "v2", value: mouse},
            time: {type: "f", value: 0},
            rotation: {type: "m4", value: makeMatrix(mouse.x, mouse.y, 0, 0, 0, 0)},
            mode: {type: "i", value: mode}
		}
	});

var quad = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2),
	shader
);
scene.add(quad);
camera.position.z = 15;
render();
function render() {
  if(!paused){
    requestAnimationFrame(render);
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      resolution = new THREE.Vector3(canvas.clientWidth, canvas.clientHeight, 1.5);
    }
    var t = clock.getElapsedTime();
    shader.uniforms["res"].value = resolution;
    shader.uniforms["m"].value = mouse;
    shader.uniforms["time"].value = t;

    shader.uniforms["rotation"].value = makeMatrix(mouse.x, mouse.y, velocity1*t, velocity2*t, velocity3*t, velocity4*t);

    shader.uniforms["mode"].value = mode;

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
