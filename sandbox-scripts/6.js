(function() {

// 6 - Rotate a Lit and Textured Cube with Slanted Top

// Creates a canvas element, sets its size, and adds it to the DOM
var canvas = document.createElement('canvas');
canvas.width = (window.innerWidth*0.8)*2; // I multiply the canvas size by 2 and scale it down with CSS to effectively create a @2x graphic for my retina display
canvas.height = (window.innerHeight*0.8)*2;
document.body.appendChild(canvas);

var gl = canvas.getContext('webgl');

// Some browsers, like Edge, require the contexts to have the 'experimental-' prefix
if (!gl) {
	console.log('WebGL not supported, falling back on experimental-webgl');
	gl = canvas.getContext('experimental-webgl');
}

// If the browser does not support WebGL at all
if (!gl) {
	alert('Your browser does not support WebGl');
}

// Flags that make the GPU:
// 1. Render only the formost pixels (DEPTH TEST)
// 2. Skip calculations for pixels that won’t be seen (CULL)
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);
gl.cullFace(gl.BACK);



// Begin Vertex Shader
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
	precision mediump float;

	attribute vec3 vertPosition;
	attribute vec2 vertTexCoord;
	attribute vec3 vertNormal;

	varying vec2 fragTextCoord;
	varying vec3 fragNormal;

	uniform mat4 mWorld;
	uniform mat4 mView;
	uniform mat4 mProj;

	void main() {
		fragTextCoord = vertTexCoord;
		fragNormal = (mWorld * vec4(vertNormal, 0.0)).xyz;

		gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
	}
`);
gl.compileShader(vertexShader);

// Outputs any vertex shader compile errors to the console
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
	console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
	return;
}
// End Vertex Shader



// Begin Fragment Shader
var framentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(framentShader, `
	precision mediump float;

	varying vec2 fragTextCoord;
	varying vec3 fragNormal;

	uniform sampler2D sampler;
	uniform vec3 ambientLightIntensity;
	uniform vec3 directionalVector;
	uniform vec3 directionalLightColor;
	

	void main() {
		vec3 surfaceNormal = normalize(fragNormal);
		vec4 texel = texture2D(sampler, fragTextCoord);
		vec3 lighting = ambientLightIntensity + (directionalLightColor * (max(dot(surfaceNormal, normalize(directionalVector)), 0.0)));

		gl_FragColor = vec4(texel.rgb * lighting, texel.a);
	}
`);
gl.compileShader(framentShader);

// Outputs any fragment shader compile errors to the console
if (!gl.getShaderParameter(framentShader, gl.COMPILE_STATUS)) {
	console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(framentShader));
	return;
}
// End Fragment Shader



// Begin Program
var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, framentShader);
gl.linkProgram(program);

// Outputs any program linking errors to the console
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	console.error('ERROR linking program', gl.getProgramInfolog(program));
}

// DEBUG ENV ONLY - Validates the program and outputs any errors to the console
gl.validateProgram(program);
if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
	console.error('ERROR validating program', gl.getProgramInfolog(program));
}
// End Program



// Establish Variables for creating and rendering the model

// List of X, Y, Z coordinates (model vertices) and U, V (used for texturing) for each corner point
var boxVertices = [
	// Top
	-1.00,  1.00, -1.00,	 0.00,  0.00,
	-1.00,  1.00,  1.00,	 0.00,  1.00,
	 1.00,  1.00,  1.00,	 1.00,  1.00,
	 1.00,  1.00, -1.00,	 1.00,  0.00,

	// Left
	-1.00,  1.00,  1.00,	 0.00,  0.00,
	-1.00, -1.00,  1.00,	 1.00,  0.00,
	-1.00, -1.00, -1.00,	 1.00,  1.00,
	-1.00,  1.00, -1.00,	 0.00,  1.00,

	// Right
	 1.00,  1.00,  1.00,	 1.00,  1.00,
	 1.00, -1.00,  1.00,	 0.00,  1.00,
	 1.00, -1.00, -1.00,	 0.00,  0.00,
	 1.00,  1.00, -1.00,	 1.00,  0.00,

	 // Front
	 1.00,  1.00,  1.00,	 1.00,  1.00,
	 1.00, -1.00,  1.00,	 1.00,  0.00,
	-1.00, -1.00,  1.00,	 0.00,  0.00,
	-1.00,  1.00,  1.00,	 0.00,  1.00,

	// Back
	 1.00,  1.00, -1.00,	 0.00,  0.00,
	 1.00, -1.00, -1.00,	 0.00,  1.00,
	-1.00, -1.00, -1.00,	 1.00,  1.00,
	-1.00,  1.00, -1.00,	 1.00,  0.00,

	// Bottom
	-1.00, -1.00, -1.00,	 1.00,  1.00,
	-1.00, -1.00,  1.00,	 1.00,  0.00,
	 1.00, -1.00,  1.00,	 0.00,  0.00,
	 1.00, -1.00, -1.00,	 0.00,  1.00,
];

var boxNormals = [
	// Top
	 0.00,  1.00,  0.00,
	 0.00,  1.00,  0.00,
	 0.00,  1.00,  0.00,
	 0.00,  1.00,  0.00,

	// Left
	-1.00,  0.00,  0.00,
	-1.00,  0.00,  0.00,
	-1.00,  0.00,  0.00,
	-1.00,  0.00,  0.00,

	// Right
	 1.00,  0.00,  0.00,
	 1.00,  0.00,  0.00,
	 1.00,  0.00,  0.00,
	 1.00,  0.00,  0.00,

	 // Front
	 0.00,  0.00,  1.00,
	 0.00,  0.00,  1.00,
	 0.00,  0.00,  1.00,
	 0.00,  0.00,  1.00,

	// Back
	 0.00,  0.00, -1.00,
	 0.00,  0.00, -1.00,
	 0.00,  0.00, -1.00,
	 0.00,  0.00, -1.00,

	// Bottom
	 0.00, -1.00,  0.00,
	 0.00, -1.00,  0.00,
	 0.00, -1.00,  0.00,
	 0.00, -1.00,  0.00,
]

// Creates triangles by referring to the aforementioned vertices
var boxIndices = [
	// Top
	0, 1, 2,
	0, 2, 3,

	// Left
	5, 4, 6,
	6, 4, 7,

	// Right
	8, 9, 10,
	8, 10, 11,

	// Front
	13, 12, 14,
	15, 14, 12,

	// Back
	16, 17, 18,
	16, 18, 19,

	// Bottom
	21, 20, 22,
	22, 20, 23
];

var lighting = {
	ambientIntensity: [0.2, 0.2, 0.2],
	directionalVector: [0.5, 0.3, 1.0],
	directionalColor: [1.0, 1.0, 1.0]
}
var cameraDistance = 6;



// Send data from CPU memory to GPU memory
var boxVertexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

var boxIndexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

var boxNormalsBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, boxNormalsBufferObject);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxNormals), gl.STATIC_DRAW);

gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
gl.vertexAttribPointer(
	positionAttribLocation, // Attribute location
	3, // Number of elements per attribute,
	gl.FLOAT, // Type of elements
	gl.FALSE, // Is the data normalized?
	5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	0 // Offset from the beginning of a single vertex to this attribute
);
gl.enableVertexAttribArray(positionAttribLocation);

var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
gl.vertexAttribPointer(
	texCoordAttribLocation, // Attribute location
	2, // Number of elements per attribute,
	gl.FLOAT, // Type of elements
	gl.FALSE, // Is the data normalized?
	5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
);
gl.enableVertexAttribArray(texCoordAttribLocation);

gl.bindBuffer(gl.ARRAY_BUFFER, boxNormalsBufferObject);
var normalAttribLocation = gl.getAttribLocation(program, 'vertNormal');
gl.vertexAttribPointer(
	normalAttribLocation,
	3,
	gl.FLOAT,
	gl.TRUE,
	3 * Float32Array.BYTES_PER_ELEMENT,
	0 * Float32Array.BYTES_PER_ELEMENT
);
gl.enableVertexAttribArray(normalAttribLocation);

// Get texture and send to GPU
var image = new Image();
image.src = 'crate.png';

var boxTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, boxTexture);

image.addEventListener('load', function() {
	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		image
	);
	animate();
});


// Send Lighting Data to Shaders
gl.useProgram(program);

var ambientUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
var directionalVectorUniformLocation = gl.getUniformLocation(program, 'directionalVector');
var directionalColorUniformLocation = gl.getUniformLocation(program, 'directionalLightColor');

gl.uniform3f(ambientUniformLocation, lighting.ambientIntensity[0], lighting.ambientIntensity[1], lighting.ambientIntensity[2]);
gl.uniform3f(directionalVectorUniformLocation, lighting.directionalVector[0], lighting.directionalVector[1], lighting.directionalVector[2]);
gl.uniform3f(directionalColorUniformLocation, lighting.directionalColor[0], lighting.directionalColor[1], lighting.directionalColor[2]);



// Create the matrixes that handle how the 3D objects are rendered into 3D space
gl.useProgram(program);
var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

var worldMatrix = mat4.create();
var viewMatrix = mat4.create();
var projMatrix = mat4.create();

mat4.identity(worldMatrix);
mat4.lookAt(viewMatrix, [0, 0, cameraDistance], [0, 0, 0], [0, 1, 0]);
mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width/canvas.height, 0.1, 1000.0);

gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);


// Mouse Events
var AMORTIZATION = 0.95;
var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;

var mouseDown = function(e) {
	drag = true;
	old_x = e.pageX, old_y = e.pageY;
	e.preventDefault();
	return false;
};

var mouseUp = function(e){
	drag = false;
};

var mouseMove = function(e) {
	if (!drag) return false;
	dX = (e.pageX-old_x)*2*Math.PI/canvas.width,
	dY = (e.pageY-old_y)*2*Math.PI/canvas.height;
	THETA+= dX;
	PHI+=dY;
	old_x = e.pageX, old_y = e.pageY;
	e.preventDefault();
};

canvas.addEventListener("mousedown", mouseDown, false);
canvas.addEventListener("mouseup", mouseUp, false);
canvas.addEventListener("mouseout", mouseUp, false);
canvas.addEventListener("mousemove", mouseMove, false);



// Inititalizing variables for Main Render Loop
var THETA = -0.5121331089793583,
PHI = 0.4182614780855906;

var xRotationMatrix = mat4.create();
var yRotationMatrix = mat4.create();
var identityMatrix = mat4.create();
mat4.identity(identityMatrix);



// Main Render Loop
var animate = function() {

	// Creates “momentum” and “friction”
	if (!drag) {
	   dX *= AMORTIZATION, dY*=AMORTIZATION;
	   THETA+=dX, PHI+=dY;
	}

	// Applies the transformations
	mat4.rotateY(yRotationMatrix, identityMatrix, THETA);
	mat4.rotateX(xRotationMatrix, identityMatrix, PHI);
	mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);

	// Sends the updated matrix to the GPU
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	// Actually performs the draw operation
	gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

	requestAnimationFrame(animate);
}
}());