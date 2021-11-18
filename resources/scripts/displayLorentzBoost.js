(function(){
	console.error = function (message) {
		if("7" in arguments) {
			$("#error").html("<h3>Shader failed to compile</h3><ul>")
			$("#error").append(arguments[7].replace(/ERROR: \d+:(\d+)/g, function(m, c) { return  "<li>Line " + String(Number(c) - 27); }));
			$("#error").append("</ul>");
		}
	};
})();

function readmouse(event){
	var canvas = document.getElementById("canvas");
	var rect = canvas.getBoundingClientRect();

	rapidity = (rect.left - event.clientX)/rect.width;
	//rapidity = Math.atanh(rapidity);
  rapidity = -2.0*rapidity - 1.0;
	var zeta = document.getElementById("zeta");
	zeta.innerHTML = zeta.innerHTML.replace(zeta.innerHTML, "ζ=" + rapidity);
}

var canvas = document.getElementById("canvas");
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
var camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientWidth, 1, 1000);
var resolution = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);

var rapidity = 0.0;
var shader = new THREE.ShaderMaterial({
		vertexShader: document.getElementById("vs").textContent,
		fragmentShader: document.getElementById("fs").textContent,
		depthWrite: false,
		depthTest: false,
		uniforms: {
			res: { type: "v2", value: resolution },
			rapidity: { type: "f", value: rapidity },
		}
	});
var quad = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2),
	shader
);
scene.add(quad);
camera.position.z = 10;

render();
function render() {
	requestAnimationFrame(render);
	if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
		renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
		resolution = new THREE.Vector3(canvas.clientWidth, canvas.clientHeight, 1.0);
	}
	shader.uniforms["res"].value = resolution;
	shader.uniforms["rapidity"].value = rapidity;
	renderer.render(scene, camera);
}
