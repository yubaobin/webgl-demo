import matIV from '../util/minMatrix';
import icon from '../assets/img/icon-search.png';
import back from '../assets/img/back.jpg';
$(function () {
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  var canvas = document.getElementById('canvas');
  var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  /* 设置清除颜色为黑色，不透明 */
  gl.clearColor(0, 0, 0, 1.0);
  /* 设置3D的深度 */
  gl.clearDepth(1.0);
  /* 开启“深度测试”, Z-缓存 */
  gl.enable(gl.DEPTH_TEST);
  /* 设置遮挡剔除有效 */
  // gl.enable(gl.CULL_FACE);
  /* 设置深度测试，近的物体遮挡远的物体 */
  gl.depthFunc(gl.LEQUAL);
  /* 清除颜色和深度缓存 */
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  /* 创建编译着色器 */
  var vs = create_shader(gl, 'vs');
  var fs = create_shader(gl, 'fs');
  /* 创建程序对象, 连接着色器 */
  var program = create_program(gl, vs, fs);

  var attLocation = new Array();
  attLocation[0] = gl.getAttribLocation(program, 'position');
  attLocation[1] = gl.getAttribLocation(program, 'color');
  attLocation[2] = gl.getAttribLocation(program, 'textureCoord');

  var attStride = new Array();
  attStride[0] = 3;
  attStride[1] = 4;
  attStride[2] = 2;

  var position = [
    -1.0, 1.0, 0.0,
    1.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0
  ];
  var color = [
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0
  ];
  var textureCoord = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0
  ];
  var index = [
    0, 1, 2,
    3, 2, 1
  ];
  var vPosition = create_vbo(gl, position);
  var vColor = create_vbo(gl, color);
  var vTextureCoord = create_vbo(gl, textureCoord);
  var VBOList = [vPosition, vColor, vTextureCoord];
  set_attr(gl, VBOList, attLocation, attStride);

  var iIndex = create_ibo(gl, index);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iIndex);

  var uniLocation = new Array();
  uniLocation[0]  = gl.getUniformLocation(program, 'mvpMatrix');
  uniLocation[1]  = gl.getUniformLocation(program, 'texture1');
  uniLocation[2]  = gl.getUniformLocation(program, 'texture2');

  var m = new matIV();
  var mMatrix   = m.identity(m.create());
  var vMatrix   = m.identity(m.create());
  var pMatrix   = m.identity(m.create());
  var tmpMatrix = m.identity(m.create());
  var mvpMatrix = m.identity(m.create());

  m.lookAt([0.0, 2.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
  m.perspective(45, canvas.width / canvas.height, 0.1, 100, pMatrix);
  m.multiply(pMatrix, vMatrix, tmpMatrix);

  var texture1 = null, texture2 = null;

  var image1 = new Image();
  image1.onload = function() {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1); //用图片作为纹理
    gl.generateMipmap(gl.TEXTURE_2D); //纹理映射
    gl.bindTexture(gl.TEXTURE_2D, null); //解除绑定
    texture1 = tex;
    window.requestAnimationFrame(animation);
  }
  image1.src = back;

  var image2 = new Image();
  image2.onload = function() {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2); //用图片作为纹理
    gl.generateMipmap(gl.TEXTURE_2D); //纹理映射
    gl.bindTexture(gl.TEXTURE_2D, null); //解除绑定
    texture2 = tex;
    window.requestAnimationFrame(animation);
  }
  image2.src = icon;

  var count = 0;
  function animation() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // 计数器递增
    count++;

    // 使用计数器算出弧度
    var rad = (count % 360) * Math.PI / 180;
    //设置纹理有效
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.uniform1i(uniLocation[1], 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.uniform1i(uniLocation[2], 1);

    m.identity(mMatrix);
    m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
    m.multiply(tmpMatrix, mMatrix, mvpMatrix);

    gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

    gl.flush();

    window.requestAnimationFrame(animation);
  }
})

/* 生成编译着色器 */
function create_shader(gl, id) {
  // 用来保存着色器的变量
  var shader;
  // 根据id从HTML中获取指定的script标签
  var scriptElement = document.getElementById(id);
  // 如果指定的script标签不存在，则返回
  if (!scriptElement) {
    return;
  }
  // 判断script标签的type属性
  switch (scriptElement.type) {

    // 顶点着色器的时候
    case 'x-shader/x-vertex':
      shader = gl.createShader(gl.VERTEX_SHADER);
      break;

    // 片段着色器的时候
    case 'x-shader/x-fragment':
      shader = gl.createShader(gl.FRAGMENT_SHADER);
      break;
    default :
      return;
  }
  // 将标签中的代码分配给生成的着色器
  gl.shaderSource(shader, scriptElement.text);
  // 编译着色器
  gl.compileShader(shader);
  // 判断一下着色器是否编译成功
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

    // 编译成功，则返回着色器
    return shader;
  } else {

    // 编译失败，弹出错误消息
    alert(gl.getShaderInfoLog(shader));
  }
}

/* 创建程序对象，连接着色器 */
function create_program(gl, vs, fs) {
  // 程序对象的生成
  var program = gl.createProgram();
  // 向程序对象里分配着色器
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  // 将着色器连接
  gl.linkProgram(program);
  // 判断着色器的连接是否成功
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {

    // 成功的话，将程序对象设置为有效
    gl.useProgram(program);
    // 返回程序对象
    return program;
  } else {

    // 如果失败，弹出错误信息
    alert(gl.getProgramInfoLog(program));
  }
}

/* 创建VBO(顶点缓存)对象 */
function create_vbo(gl, data) {
  // 生成缓存对象
  var vbo = gl.createBuffer();
  // 绑定缓存
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  // 向缓存中写入数据
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  // 将绑定的缓存设为无效
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  // 返回生成的VBO
  return vbo;
}

function set_attr(gl, vbo, attrL, attrS) {
  for (var i in vbo) {
    // 绑定缓存
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
    // 将attributeLocation设置为有效
    gl.enableVertexAttribArray(attrL[i]);
    //通知并添加attributeLocation
    gl.vertexAttribPointer(attrL[i], attrS[i], gl.FLOAT, false, 0, 0);
  }
}

function create_ibo(gl, data) {
  // 生成缓存对象
  var ibo = gl.createBuffer();
  // 绑定缓存
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  // 向缓存中写入数据
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
  // 将缓存的绑定无效化
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  // 返回生成的IBO
  return ibo;
}