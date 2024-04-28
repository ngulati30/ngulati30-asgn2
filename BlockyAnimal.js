// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;
// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  // u_size = gl.getUniformLocation(gl.program, "u_size");
  // if (!u_size) {
  //   console.log("Failed to get the storage location of u_Size");
  //   return;
  // }

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix"
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}
// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//globals related to UI elements
let g_tailAnimation = false;
let g_headAnimation = false;
let g_bodyAnimation = false;
let g_xRotation = 0;
let g_yRotation = 0;
let g_globalAngle = 0;
let g_bodyAngle = 0;
let g_tailAngle = 0;
let g_headAngle = 0;
let g_selectedColor = [0.5, 0.5, 0.5, 1.0];
let g_selectedSize = 20;
let g_selectedType = POINT;
let num_segments = 5;

function addActionsForHtmlUI() {
  document.getElementById("animationTailOffButton").onclick = function () {
    g_tailAnimation = false;
  };
  document.getElementById("animationTailOnButton").onclick = function () {
    g_tailAnimation = true;
  };

  document.getElementById("animationHeadOffButton").onclick = function () {
    g_headAnimation = false;
  };
  document.getElementById("animationHeadOnButton").onclick = function () {
    g_headAnimation = true;
  };

  document.getElementById("animationBodyOffButton").onclick = function () {
    g_bodyAnimation = false;
  };
  document.getElementById("animationBodyOnButton").onclick = function () {
    g_bodyAnimation = true;
  };

  document
    .getElementById("tailSlide")
    .addEventListener("mousemove", function () {
      g_tailAngle = this.value;
      renderAllShapes();
    });

  document
    .getElementById("bodySlide")
    .addEventListener("mousemove", function () {
      g_bodyAngle = this.value;
      renderAllShapes();
    });

  document
    .getElementById("headSlide")
    .addEventListener("mousemove", function () {
      g_headAngle = this.value;
      renderAllShapes();
    });

  document
    .getElementById("angleSlide")
    .addEventListener("mousemove", function () {
      g_globalAngle = this.value;
      renderAllShapes();
    });
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();

  canvas.onmousedown = click;

  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
      g_xRotation += ev.movementX;
      g_yRotation += ev.movementY;
      renderAllShapes();
    }
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAnimationAngles();
  // console.log(performance.now());
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_headAnimation) {
    g_headAngle = 5 * Math.sin(2 * g_seconds);
  }
  if (g_bodyAnimation) {
    g_bodyAngle = 5 * Math.sin(2 * g_seconds);
  }

  if (g_tailAnimation) {
    g_tailAngle = 20 * Math.sin(10 * g_seconds);
  }
}

g_shapesList = [];

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);
  // Store the coordinates to g_points array

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }
  if (g_selectedType == CIRCLE) {
    point.segments = num_segments;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function renderAllShapes() {
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  globalRotMat.translate(0.1, 0, 0);
  globalRotMat.rotate(-4, 0, 1, 0);
  globalRotMat.rotate(g_xRotation, 0, 1, 0);
  globalRotMat.rotate(g_yRotation, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  renderScene();

  var duration = performance.now() - startTime;
  sendTextToHTML(
    " ms: " +
      Math.floor(duration) +
      "fps: " +
      Math.floor(10000 / duration) / 10,
    "numdot"
  );
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML ");
    return;
  }
  htmlElm.innerHTML = text;
}

function renderScene() {
  // Define colors for different parts of the pig
  var colors = {
    body: [0.9, 0.6, 0.65, 1.0],
    head: [0.9, 0.6, 0.65, 1.0],
    leg: [0.9, 0.6, 0.65, 1.0],
    ear: [0.9, 0.3, 0.7, 1.0],
    snout: [1.0, 1.0, 0.8, 1.0],
    tail: [0.9, 0.3, 0.7, 1.0],
    new: [0.9, 0.3, 0.7, 1.0],
  };

  // Body of the pig
  var body = new Cube();
  body.color = colors.body;
  body.matrix.setTranslate(-0.4, -0.3, 0.0);
  body.matrix.rotate(g_bodyAngle, 1, 0, 1);
  var bodyCoordinatesMat = new Matrix4(body.matrix);
  body.matrix.scale(1, 0.5, 0.5);
  body.render();

  // Head of the pig
  var head = new Cube();
  head.color = colors.head;
  head.matrix = bodyCoordinatesMat;
  head.matrix.translate(-0.35, 0.1, 0.035);
  head.matrix.rotate(g_headAngle, 0, 1, 0);
  head.matrix.scale(0.45, 0.45, 0.45);
  head.render();

  // front left leg
  var legBackRight = new Cube();
  legBackRight.color = colors.leg;
  legBackRight.matrix.setTranslate(-0.35, -0.45, -0.05);
  legBackRight.matrix.scale(0.15, 0.2, 0.15);
  legBackRight.render();

  // back left leg
  var legFrontRight = new Cube();
  legFrontRight.color = colors.leg;
  legFrontRight.matrix.setTranslate(-0.15, -0.45, 0.4);
  legFrontRight.matrix.scale(0.15, 0.2, 0.15);
  legFrontRight.render();

  // back left leg
  var legBackLeft = new Cube();
  legBackLeft.color = colors.leg;
  legBackLeft.matrix.setTranslate(0.15, -0.45, -0.05);
  legBackLeft.matrix.scale(0.15, 0.2, 0.15);
  legBackLeft.render();

  // back right leg
  var legFrontLeft = new Cube();
  legFrontLeft.color = colors.leg;
  legFrontLeft.matrix.setTranslate(0.35, -0.45, 0.4);
  legFrontLeft.matrix.scale(0.15, 0.2, 0.15);
  legFrontLeft.render();
  // Snout of the pig
  var snout = new Cube();
  snout.color = colors.snout;
  snout.matrix = bodyCoordinatesMat;
  snout.matrix.translate(-0.5, 0, 0.225);
  snout.matrix.scale(0.5, 0.5, 0.5);
  snout.render();

  var leftEar = new Cube();
  leftEar.color = colors.ear;
  leftEar.matrix = bodyCoordinatesMat;
  leftEar.matrix.translate(1.2, 2.0, -0.2);
  leftEar.matrix.scale(0.2, 0.3, 0.2);
  leftEar.render();

  var rightEar = new Cube();
  rightEar.color = colors.ear;
  rightEar.matrix = bodyCoordinatesMat;
  rightEar.matrix.translate(0, 0, 6);
  rightEar.matrix.scale(1, 1, 1);
  rightEar.render();

  // Tail of the pig - small triangular prism to represent the tail
  var tail = new TriangularPrism();
  tail.color = colors.tail;
  tail.matrix = bodyCoordinatesMat;
  tail.matrix.translate(28, -5, -2.5);
  tail.matrix.rotate(g_tailAngle, 0, 0, 1);
  tail.matrix.scale(4, 2, 2.5);
  tail.render();
}
