class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //front of the cube
    drawTriangle3D([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]);
    drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.7,
      rgba[1] * 0.6,
      rgba[2] * 0.5,
      rgba[3]
    );

    //back of the cube
    drawTriangle3D([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0]);
    drawTriangle3D([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.9,
      rgba[1] * 0.8,
      rgba[2] * 0.8,
      rgba[3]
    );

    //top of the cube
    drawTriangle3D([0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3D([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.7,
      rgba[1] * 0.6,
      rgba[2] * 0.5,
      rgba[3]
    );

    //bottom of the cube
    drawTriangle3D([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0]);
    drawTriangle3D([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.7,
      rgba[1] * 0.6,
      rgba[2] * 0.5,
      rgba[3]
    );

    //right of the cube
    drawTriangle3D([1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3D([1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.7,
      rgba[1] * 0.6,
      rgba[2] * 0.5,
      rgba[3]
    );

    //left of the cube
    drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0]);
    drawTriangle3D([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.7,
      rgba[1] * 0.6,
      rgba[2] * 0.5,
      rgba[3]
    );
  }
}
