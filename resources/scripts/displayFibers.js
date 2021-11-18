"use strict";

var input1 = document.getElementById("velocity1");
var input2 = document.getElementById("velocity2");

var velocity1 = 0.2;
var velocity2 = 0.2;

var val1 = document.getElementById("val1");
var val2 = document.getElementById("val2");

input1.oninput = function(){
  velocity1 = 0.2*this.value;
  val1.innerHTML = val1.innerHTML.replace(val1.innerHTML, "Lateral Angular Velocity: " + velocity1).substring(0,31);
}

input2.oninput = function(){
  velocity2 = 0.2*this.value;
  val2.innerHTML = val2.innerHTML.replace(val2.innerHTML, "Longitudinal Angular Velocity: " + velocity2).substring(0,36);
}

var paused = false;
var pauseBtn = document.getElementById("pause");
pauseBtn.onclick = function(){
  paused = !paused;
  pauseBtn.innerHTML = pauseBtn.innerHTML.replace(pauseBtn.innerHTML, paused ? "Unpause" : "Pause");
}

function readMouse(event){
	var canvas = document.getElementById("canvas");
	var rect = canvas.getBoundingClientRect();
	var scaleX = 1.0/rect.width;
	var scaleY = 1.0/rect.height;
	mouse = new THREE.Vector2((rect.left - event.clientX)*scaleX,
                            (event.clientY - rect.bottom)*scaleY);
}

function dot(a, b){return a.x*b.x + a.y*b.y + a.z*b.z;}

function cross(a, b){return new THREE.Vector3(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x);}

function multiply(s, v){return new THREE.Vector3(s*v.x, s*v.y, s*v.z);}

function multiply4(s, v){return new THREE.Vector4(s*v.x, s*v.y, s*v.z, s*v.w);}

function length(v){return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);}

function addScalar(s, v){return new THREE.Vector3(s + v.x, s + v.y, s + v.z);}

function addVector(v, w){return new THREE.Vector3(v.x + w.x, v.y + w.y, v.z + w.z);}

function subVector(v, w){return new THREE.Vector3(v.x - w.x, v.y - w.y, v.z - w.z);}

function distance(a, b){return length(subVector(a, b));}

function normalize(v){return multiply(1.0/length(v), v);}

var longitudinalSamps = 1;
var lattitudinalSamps = 16;

function intersectLines(line1origin, line1direction, line2origin, line2direction){
    var C = addVector(line1origin, line1direction);
    var D = addVector(line2origin, line2direction);
    var fcg = cross(line2direction, subVector(D, C));
    var fce = cross(line2direction, line1direction);
    return addVector(C, multiply(length(fcg)/length(fce), multiply(Math.sign(dot(fce, fcg)), line1direction)));
}

function unitVector(angle1, angle2){
  var s2 = Math.sin(angle2);
  return new THREE.Vector3(Math.sin(angle1)*s2, Math.cos(angle1)*s2, Math.cos(angle2));
}

function rotateTo(v){
  var quat = new THREE.Vector4(0.0, v.z, -v.y, Math.sqrt(1.0 + v.x));
  var result = new THREE.Matrix3;
  result.set(
    1.0 - (quat.y*quat.y + quat.z*quat.z), quat.w*quat.z, -quat.w*quat.y,
    -quat.w*quat.z, 1.0 - quat.z*quat.z, quat.y*quat.z,
    quat.w*quat.y, quat.y*quat.z, 1.0 - quat.y*quat.y);
  return result;
}

function transpose(mat){
  var elems = mat.elements;
  var result = new THREE.Matrix3();
  result.set( elems[0], elems[3], elems[6]
            , elems[1], elems[4], elems[7]
            , elems[2], elems[5], elems[8]);
  return result;
}

function stereoProj(v){ return multiply(1.0/(1.0 - v.w), new THREE.Vector3(v.x, v.y, v.z));}

function getFiber(p, t){
  var pz = p.z + 1.0;
  var trig = new THREE.Vector2(Math.sin(t), Math.cos(t));
  var result = new THREE.Vector4(pz*trig.y,
                                 p.x*trig.x - p.y*trig.y,
                                 p.x*trig.y + p.y*trig.x,
                                 pz*trig.x);
  return multiply4(Math.sqrt(0.4/pz), result);
}

var canvas = document.getElementById("canvas");
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
var camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientWidth, 1, 1555);
var clock = new THREE.Clock();
var resolution = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);
var channelResolution = new THREE.Vector3(128.5, 128.5, 5.5);
var mouse = new THREE.Vector2(0, 0);

//i = 1, j runs from 1 to 16
function makeTorusData(i, j, t, v1, v2){
  var unit = unitVector(2.0*Math.PI*i/longitudinalSamps + v1*t + 5.0*mouse.x,
                        Math.PI*j/lattitudinalSamps - 0.5*Math.PI + v2*t + 5.0*mouse.y);
  var v1 = stereoProj(getFiber(unit, 0.0));
  var v2 = subVector(stereoProj(getFiber(unit, 1.5)), v1);
  var v3 = subVector(stereoProj(getFiber(unit, 3.0)), v1);
  var orientation = normalize(cross(v2, v3));
  var l1o = addVector(v1, multiply(0.5, v2));
  var l1d = cross(orientation, v2);
  var l2o = addVector(v1, multiply(0.5, v3));
  var l2d = cross(orientation, v3);
  var center = intersectLines(l1o, l1d, l2o, l2d);
  var centerAndRad = new THREE.Vector4(center.x, center.y, center.z, distance(center, v1));
  return {color: addScalar(0.5, multiply(0.5, unit)), rotation: transpose(rotateTo(orientation)), center: centerAndRad};
}

var toriData = new Array();
for(var j = 0; j < lattitudinalSamps; j++) toriData.push(makeTorusData(1, j, 0, velocity1, velocity2));

var shader = new THREE.ShaderMaterial({
		vertexShader: document.getElementById("vs").textContent,
		fragmentShader: document.getElementById("fs").textContent,
		depthWrite: false,
		depthTest: false,
		uniforms: {
			res: { type: "v2", value: resolution },
			m: { type: "v2", value: mouse },
			time: {type: "f", value: 5 },
      torus0Col: {type: "v3", value: toriData[0].color},
      torus0Mat: {type: "m3", value: toriData[0].rotation},
      torus0Cen: {type: "v4", value: toriData[0].center},

      torus1Col: {type: "v3", value: toriData[1].color},
      torus1Mat: {type: "m3", value: toriData[1].rotation},
      torus1Cen: {type: "v4", value: toriData[1].center},

      torus2Col: {type: "v3", value: toriData[2].color},
      torus2Mat: {type: "m3", value: toriData[2].rotation},
      torus2Cen: {type: "v4", value: toriData[2].center},

      torus3Col: {type: "v3", value: toriData[3].color},
      torus3Mat: {type: "m3", value: toriData[3].rotation},
      torus3Cen: {type: "v4", value: toriData[3].center},

      torus4Col: {type: "v3", value: toriData[4].color},
      torus4Mat: {type: "m3", value: toriData[4].rotation},
      torus4Cen: {type: "v4", value: toriData[4].center},

      torus5Col: {type: "v3", value: toriData[5].color},
      torus5Mat: {type: "m3", value: toriData[5].rotation},
      torus5Cen: {type: "v4", value: toriData[5].center},

      torus6Col: {type: "v3", value: toriData[6].color},
      torus6Mat: {type: "m3", value: toriData[6].rotation},
      torus6Cen: {type: "v4", value: toriData[6].center},

      torus7Col: {type: "v3", value: toriData[7].color},
      torus7Mat: {type: "m3", value: toriData[7].rotation},
      torus7Cen: {type: "v4", value: toriData[7].center},

      torus8Col: {type: "v3", value: toriData[8].color},
      torus8Mat: {type: "m3", value: toriData[8].rotation},
      torus8Cen: {type: "v4", value: toriData[8].center},

      torus9Col: {type: "v3", value: toriData[9].color},
      torus9Mat: {type: "m3", value: toriData[9].rotation},
      torus9Cen: {type: "v4", value: toriData[9].center},

      torus10Col: {type: "v3", value: toriData[10].color},
      torus10Mat: {type: "m3", value: toriData[10].rotation},
      torus10Cen: {type: "v4", value: toriData[10].center},

      torus11Col: {type: "v3", value: toriData[11].color},
      torus11Mat: {type: "m3", value: toriData[11].rotation},
      torus11Cen: {type: "v4", value: toriData[11].center},

      torus12Col: {type: "v3", value: toriData[12].color},
      torus12Mat: {type: "m3", value: toriData[12].rotation},
      torus12Cen: {type: "v4", value: toriData[12].center},

      torus13Col: {type: "v3", value: toriData[13].color},
      torus13Mat: {type: "m3", value: toriData[13].rotation},
      torus13Cen: {type: "v4", value: toriData[13].center},

      torus14Col: {type: "v3", value: toriData[14].color},
      torus14Mat: {type: "m3", value: toriData[14].rotation},
      torus14Cen: {type: "v4", value: toriData[14].center},

      torus15Col: {type: "v3", value: toriData[15].color},
      torus15Mat: {type: "m3", value: toriData[15].rotation},
      torus15Cen: {type: "v4", value: toriData[15].center}
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

    for(var j = 0; j < lattitudinalSamps; j++) toriData[j] = makeTorusData(1, j, t, velocity1, velocity2);

    shader.uniforms["torus0Col"].value = toriData[0].color;
    shader.uniforms["torus0Mat"].value = toriData[0].rotation;
    shader.uniforms["torus0Cen"].value = toriData[0].center;

    shader.uniforms["torus1Col"].value = toriData[1].color;
    shader.uniforms["torus1Mat"].value = toriData[1].rotation;
    shader.uniforms["torus1Cen"].value = toriData[1].center;

    shader.uniforms["torus2Col"].value = toriData[2].color;
    shader.uniforms["torus2Mat"].value = toriData[2].rotation;
    shader.uniforms["torus2Cen"].value = toriData[2].center;

    shader.uniforms["torus3Col"].value = toriData[3].color;
    shader.uniforms["torus3Mat"].value = toriData[3].rotation;
    shader.uniforms["torus3Cen"].value = toriData[3].center;

    shader.uniforms["torus4Col"].value = toriData[4].color;
    shader.uniforms["torus4Mat"].value = toriData[4].rotation;
    shader.uniforms["torus4Cen"].value = toriData[4].center;

    shader.uniforms["torus5Col"].value = toriData[5].color;
    shader.uniforms["torus5Mat"].value = toriData[5].rotation;
    shader.uniforms["torus5Cen"].value = toriData[5].center;

    shader.uniforms["torus6Col"].value = toriData[6].color;
    shader.uniforms["torus6Mat"].value = toriData[6].rotation;
    shader.uniforms["torus6Cen"].value = toriData[6].center;

    shader.uniforms["torus7Col"].value = toriData[7].color;
    shader.uniforms["torus7Mat"].value = toriData[7].rotation;
    shader.uniforms["torus7Cen"].value = toriData[7].center;

    shader.uniforms["torus8Col"].value = toriData[8].color;
    shader.uniforms["torus8Mat"].value = toriData[8].rotation;
    shader.uniforms["torus8Cen"].value = toriData[8].center;

    shader.uniforms["torus9Col"].value = toriData[9].color;
    shader.uniforms["torus9Mat"].value = toriData[9].rotation;
    shader.uniforms["torus9Cen"].value = toriData[9].center;

    shader.uniforms["torus10Col"].value = toriData[10].color;
    shader.uniforms["torus10Mat"].value = toriData[10].rotation;
    shader.uniforms["torus10Cen"].value = toriData[10].center;

    shader.uniforms["torus11Col"].value = toriData[11].color;
    shader.uniforms["torus11Mat"].value = toriData[11].rotation;
    shader.uniforms["torus11Cen"].value = toriData[11].center;

    shader.uniforms["torus12Col"].value = toriData[12].color;
    shader.uniforms["torus12Mat"].value = toriData[12].rotation;
    shader.uniforms["torus12Cen"].value = toriData[12].center;

    shader.uniforms["torus13Col"].value = toriData[13].color;
    shader.uniforms["torus13Mat"].value = toriData[13].rotation;
    shader.uniforms["torus13Cen"].value = toriData[13].center;

    shader.uniforms["torus14Col"].value = toriData[14].color;
    shader.uniforms["torus14Mat"].value = toriData[14].rotation;
    shader.uniforms["torus14Cen"].value = toriData[14].center;

    shader.uniforms["torus15Col"].value = toriData[15].color;
    shader.uniforms["torus15Mat"].value = toriData[15].rotation;
    shader.uniforms["torus15Cen"].value = toriData[15].center;

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
