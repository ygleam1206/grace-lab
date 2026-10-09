"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;

  //
  // Simplex 3D Noise (Ashima / Stefan Gustavson)
  //
  vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }
  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // FBM (Fractal Brownian Motion) — 多层噪声叠加
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);

    float t = u_time * 0.15;

    // 域扭曲 (Domain Warping) — 用噪声扰动噪声的采样坐标
    vec3 q = vec3(p, t);
    float n1 = fbm(q);
    float n2 = fbm(q + vec3(n1 * 1.5, n1 * 1.5, t * 0.5));
    float n3 = fbm(q + vec3(n2 * 1.2, -n2 * 1.2, t * 0.3));

    // 配色：紫蓝渐变流体
    vec3 color1 = vec3(0.40, 0.30, 0.80);  // 紫
    vec3 color2 = vec3(0.25, 0.45, 0.85);  // 蓝
    vec3 color3 = vec3(0.55, 0.30, 0.75);  // 深紫
    vec3 color4 = vec3(0.35, 0.55, 0.90);  // 浅蓝

    float mix1 = n2 * 0.5 + 0.5;
    float mix2 = n3 * 0.5 + 0.5;

    vec3 col = mix(color1, color2, mix1);
    col = mix(col, color3, mix2 * 0.4);
    col = mix(col, color4, n1 * 0.3 + 0.15);

    // 增加一点亮度变化
    col += 0.08 * n3;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function SimplexNoiseBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;
    const g = gl; // narrow type for closures

    // 编译着色器
    function compileShader(type: number, source: string) {
      const shader = g.createShader(type)!;
      g.shaderSource(shader, source);
      g.compileShader(shader);
      if (!g.getShaderParameter(shader, g.COMPILE_STATUS)) {
        console.error(g.getShaderInfoLog(shader));
        g.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = compileShader(g.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = compileShader(g.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = g.createProgram()!;
    g.attachShader(program, vertShader);
    g.attachShader(program, fragShader);
    g.linkProgram(program);
    g.useProgram(program);

    // 全屏四边形
    const buffer = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buffer);
    g.bufferData(
      g.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      g.STATIC_DRAW
    );

    const posLoc = g.getAttribLocation(program, "a_position");
    g.enableVertexAttribArray(posLoc);
    g.vertexAttribPointer(posLoc, 2, g.FLOAT, false, 0, 0);

    const timeLoc = g.getUniformLocation(program, "u_time");
    const resLoc = g.getUniformLocation(program, "u_resolution");

    // 处理缩放
    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      g.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    // 动画循环
    let animId: number;
    const startTime = performance.now();

    function render() {
      const elapsed = (performance.now() - startTime) / 1000;
      g.uniform1f(timeLoc, elapsed);
      g.uniform2f(resLoc, canvas!.width, canvas!.height);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-[-10]"
      style={{ display: "block" }}
    />
  );
}
