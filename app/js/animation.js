/**
 * Created by yohouakira on 2017/7/5.
 */
import matIV from '../util/minMatrix';
$(function() {
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
  gl.enable(gl.CULL_FACE);
  /* 设置深度测试，近的物体遮挡远的物体 */
  gl.depthFunc(gl.LEQUAL);
  /* 清除颜色和深度缓存 */
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

  /* 创建编译着色器 */
  var vs = create_shader(gl, 'vs');
  var fs = create_shader(gl, 'fs');

  /* 创建程序对象, 连接着色器 */
  var program = create_program(gl, vs, fs);

  /* attributeLocation的获取 */
  var attr = [];
  attr[0] = gl.getAttribLocation(program, 'position'); /* 第几个 */
  attr[1] = gl.getAttribLocation(program, 'color'); /* 颜色 */
  attr[2] = gl.getAttribLocation(program, 'normal'); /* 法线 */
  /* 为了保存这个数据是由几个元素组成的 */
  var attStride = [3, 4, 3];

  /* 模型（顶点）数据 */
  // var vertex_position = [
  //   0.0, 1.0, 0.0,
  //   1.0, 0.0, 0.0,
  //   -1.0, 0.0, 0.0
  // ];
  // var vertex_color = [
  //   1.0, 0.0, 1.0, 1.0,
  //   0.0, 1.0, 0.0, 1.0,
  //   0.0, 0.0, 1.0, 1.0
  // ]

  var circle3D = torus(32, 32, 1.0, 2.0);

  var index = circle3D[2];
  /* 生成VBO */
  var vbos = [];
  vbos[0] = create_vbo(gl, circle3D[0]);
  vbos[1] = create_vbo(gl, circle3D[1]);
  vbos[2] = create_vbo(gl, circle3D[3]);
  set_attr(gl, vbos, attr, attStride);

  var ibo = create_ibo(gl, index);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

  /* 使用minMatrix.js对矩阵的相关处理 */
  /* matIV对象生成 */
  var m = new matIV();

  /* 各种矩阵的生成和初始化 */
  var mMatrix = m.identity(m.create());
  var vMatrix = m.identity(m.create()); //视图矩阵
  var pMatrix = m.identity(m.create()); //投影矩阵
  var tmpMatrix = m.identity(m.create());
  var mvpMatrix = m.identity(m.create());
  var invMatrix = m.identity(m.create());

  // 平行光源的方向
  var lightDirection = [-0.5, 0.0, 0.5];

  //环境光参数
  var ambientColor = [0.1,0.1,0.1,1.0];
  // 视点向量
  var eyeDirection = [0.0, 0.0, 20.0];
  // uniformLocation的获取
  var uniLocation = [];
  uniLocation[0] = gl.getUniformLocation(program, 'mvpMatrix');
  uniLocation[1] = gl.getUniformLocation(program, 'invMatrix');
  uniLocation[2] = gl.getUniformLocation(program, 'lightDirection');
  uniLocation[3] = gl.getUniformLocation(program, 'ambientColor');
  uniLocation[4] = gl.getUniformLocation(program, 'eyeDirection');
  // 视图变换坐标矩阵
  m.lookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0], vMatrix);

  // 投影坐标变换矩阵
  m.perspective(45, canvas.width / canvas.height, 0.1, 100, pMatrix);

  //得到视图投影变换矩阵
  m.multiply(pMatrix, vMatrix, tmpMatrix);

  var count = 0;

  // 持续循环
  function animation(){
    // canvasを初期化
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 计数器递增
    count++;

    // 使用计数器算出弧度
    var rad = (count % 360) * Math.PI / 180;

    // 模型1按照一个圆形轨道进行旋转
    // var x = Math.cos(rad);
    // var y = Math.sin(rad);
    // m.identity(mMatrix);
    // m.translate(mMatrix, [x, y, 0.0], mMatrix);
    //
    // // 完成模型1的坐标变换矩阵，并进行绘图
    // m.multiply(tmpMatrix, mMatrix, mvpMatrix);
    // gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
    // gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 模型2沿Y轴进行旋转
    m.identity(mMatrix);
    m.rotate(mMatrix, rad, [0, 1, 1], mMatrix);

    // 完成模型2的坐标变换矩阵，并进行绘图
    m.multiply(tmpMatrix, mMatrix, mvpMatrix);
    m.inverse(mMatrix, invMatrix);

    gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
    gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
    gl.uniform3fv(uniLocation[2], lightDirection);
    gl.uniform4fv(uniLocation[3], ambientColor);
    gl.uniform3fv(uniLocation[4], eyeDirection);
    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

    // 模型3进行放大缩小
    // var s = Math.sin(rad) + 1.0;
    // m.identity(mMatrix);
    // m.translate(mMatrix, [-1.0, -1.0, 0.0], mMatrix);
    // m.scale(mMatrix, [s, s, 0.0], mMatrix)
    //
    // // 完成模型3的坐标变换矩阵，并进行绘图
    // m.multiply(tmpMatrix, mMatrix, mvpMatrix);
    // gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
    // gl.drawArrays(gl.TRIANGLES, 0, 3);

    // context刷新
    gl.flush();
    window.requestAnimationFrame(animation);

  }
  window.requestAnimationFrame(animation);
});

/* 生成编译着色器 */
function create_shader(gl, id){
  // 用来保存着色器的变量
  var shader;

  // 根据id从HTML中获取指定的script标签
  var scriptElement = document.getElementById(id);

  // 如果指定的script标签不存在，则返回
  if(!scriptElement){return;}

  // 判断script标签的type属性
  switch(scriptElement.type){

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
  if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){

    // 编译成功，则返回着色器
    return shader;
  }else{

    // 编译失败，弹出错误消息
    alert(gl.getShaderInfoLog(shader));
  }
}
/* 创建程序对象，连接着色器 */
function create_program(gl, vs, fs){
  // 程序对象的生成
  var program = gl.createProgram();

  // 向程序对象里分配着色器
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);

  // 将着色器连接
  gl.linkProgram(program);

  // 判断着色器的连接是否成功
  if(gl.getProgramParameter(program, gl.LINK_STATUS)){

    // 成功的话，将程序对象设置为有效
    gl.useProgram(program);

    // 返回程序对象
    return program;
  }else{

    // 如果失败，弹出错误信息
    alert(gl.getProgramInfoLog(program));
  }
}

/* 创建VBO(顶点缓存)对象 */
function create_vbo(gl, data){
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
  for(var i in vbo) {
    // 绑定缓存
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);

    // 将attributeLocation设置为有效
    gl.enableVertexAttribArray(attrL[i]);

    //通知并添加attributeLocation
    gl.vertexAttribPointer(attrL[i], attrS[i], gl.FLOAT, false, 0, 0);
  }
}

function create_ibo(gl, data){
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

function torus(row, column, irad, orad){
  var pos = new Array(), nor = new Array(), col = new Array(), idx = new Array();
  for(var i = 0; i <= row; i++){
    var r = Math.PI * 2 / row * i;
    var rr = Math.cos(r);
    var ry = Math.sin(r);
    for(var ii = 0; ii <= column; ii++){
      var tr = Math.PI * 2 / column * ii;
      var tx = (rr * irad + orad) * Math.cos(tr);
      var ty = ry * irad;
      var tz = (rr * irad + orad) * Math.sin(tr);
      var rx = rr * Math.cos(tr);
      var rz = rr * Math.sin(tr);
      pos.push(tx, ty, tz);
      nor.push(rx, ry, rz);
      var tc = hsva(360 / column * ii, 1, 1, 1);
      col.push(tc[0], tc[1], tc[2], tc[3]);
    }
  }
  for(i = 0; i < row; i++){
    for(ii = 0; ii < column; ii++){
      r = (column + 1) * i + ii;
      idx.push(r, r + column + 1, r + 1);
      idx.push(r + column + 1, r + column + 2, r + 1);
    }
  }
  return [pos, col, idx, nor];
}

function hsva(h, s, v, a){
  if(s > 1 || v > 1 || a > 1){return;}
  var th = h % 360;
  var i = Math.floor(th / 60);
  var f = th / 60 - i;
  var m = v * (1 - s);
  var n = v * (1 - s * f);
  var k = v * (1 - s * (1 - f));
  var color = new Array();
  if(!s > 0 && !s < 0){
    color.push(v, v, v, a);
  } else {
    var r = new Array(v, n, m, m, k, v);
    var g = new Array(k, v, v, n, m, m);
    var b = new Array(m, m, k, v, v, n);
    color.push(r[i], g[i], b[i], a);
  }
  return color;
}