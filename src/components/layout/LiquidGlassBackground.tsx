"use client";

/**
 * LiquidGlassBackground — "glass liquid new wave" WebGL background.
 *
 * Next.js 15 App Router • static export (`output: "export"`) friendly.
 * Self-contained: no external deps, shader embedded, no SSR concerns
 * (renders only on the client). Drop it once near the root and put your
 * content above it with a higher stacking context.
 *
 *   // app/layout.tsx (or any page)
 *   import LiquidGlassBackground from "@/components/LiquidGlassBackground";
 *
 *   <LiquidGlassBackground />
 *   <main className="relative z-10">…</main>
 *
 * All visual knobs are props and update live (no GL re-init).
 */

import { useEffect, useRef } from "react";

export interface LiquidGlassBackgroundProps {
  /** Motion speed. 0.45 ≈ slow, breathing. */
  speed?: number;
  /** Vertical fluted-glass refraction strength (0–0.06). Subtle by default. */
  flute?: number;
  /** Edge darkening between ribs (0–0.5). */
  fluteShade?: number;
  /** Number of vertical ribs across the width. */
  ribs?: number;
  /** Bright glint along each rib center (0–0.4). */
  spec?: number;
  /** Overall brightness multiplier. */
  bright?: number;
  /** Zoom of the flow field. */
  scale?: number;
  /** Wave density. */
  flow?: number;
  /** Hue rotation in radians (negative → bluer, positive → magenta). */
  hue?: number;
  /** Color saturation (0 = grayscale, 1 = full). */
  saturation?: number;
  /** Film grain to kill banding on dark gradients. */
  grain?: number;
  /** Cap device-pixel-ratio for performance (default 1.75). */
  maxDpr?: number;
  /**
   * Honor `prefers-reduced-motion` by slowing the animation right down.
   * Default true.
   */
  respectReducedMotion?: boolean;
  /**
   * Class for the <canvas>. Defaults to a fixed, full-viewport,
   * behind-everything layer. Override to scope it to a section, e.g.
   * "absolute inset-0 -z-10".
   */
  className?: string;
}

type Params = Required<
  Pick<
    LiquidGlassBackgroundProps,
    | "speed"
    | "flute"
    | "fluteShade"
    | "ribs"
    | "spec"
    | "bright"
    | "scale"
    | "flow"
    | "hue"
    | "saturation"
    | "grain"
  >
>;

const DEFAULTS: Params = {
  speed: 0.45,
  flute: 0.018,
  fluteShade: 0.22,
  ribs: 150,
  spec: 0.1,
  bright: 1.0,
  scale: 1.0,
  flow: 1.0,
  hue: 0.0,
  saturation: 1.0,
  grain: 0.5,
};

const VERT = `
  attribute vec2 aPos;
  void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
  precision highp float;
  uniform vec2  uRes;
  uniform float uTime;
  uniform float uFlute;
  uniform float uFluteShade;
  uniform float uRibs;
  uniform float uSpec;
  uniform float uBright;
  uniform float uScale;
  uniform float uFlow;
  uniform float uHue;
  uniform float uSat;
  uniform float uGrain;

  // hue rotation matrix
  vec3 hueRotate(vec3 c, float a){
    const vec3 k = vec3(0.57735);
    float ca = cos(a), sa = sin(a);
    return c*ca + cross(k,c)*sa + k*dot(k,c)*(1.0-ca);
  }

  // blue -> indigo -> purple -> magenta ramp
  vec3 palette(float t){
    t = clamp(t, 0.0, 1.0);
    vec3 blue    = vec3(0.13, 0.40, 1.00);
    vec3 indigo  = vec3(0.38, 0.30, 1.00);
    vec3 purple  = vec3(0.62, 0.24, 1.00);
    vec3 magenta = vec3(0.95, 0.30, 0.92);
    vec3 c;
    if (t < 0.34)      c = mix(blue,   indigo,  smoothstep(0.0, 0.34, t));
    else if (t < 0.67) c = mix(indigo, purple,  smoothstep(0.34, 0.67, t));
    else               c = mix(purple, magenta, smoothstep(0.67, 1.0, t));
    return c;
  }

  // smooth flowing scalar field (domain-warped sines)
  float field(vec2 p, float t){
    vec2 q = p;
    q.x += 0.45 * sin(p.y * 1.25 + t * 0.70);
    q.y += 0.30 * sin(p.x * 1.05 - t * 0.55);
    q.x += 0.22 * sin(p.y * 2.40 - t * 0.40);
    float f  = sin(q.x * 1.55 + q.y * 1.15 + t);
    f += 0.60 * sin(q.y * 2.30 - t * 0.80 + q.x * 0.70);
    f += 0.38 * sin((q.x + q.y) * 1.70 + t * 0.45);
    f += 0.22 * sin(q.x * 3.30 + t * 0.30);
    return f;
  }

  float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main(){
    vec2 frag = gl_FragCoord.xy;
    vec2 uv = frag / uRes;
    float aspect = uRes.x / uRes.y;

    vec2 p = (uv - 0.5);
    p.x *= aspect;
    p /= uScale;

    float t = uTime;

    // vertical fluted-glass refraction (per-rib lens)
    float rx     = uv.x * uRibs;
    float ridge  = fract(rx) - 0.5;
    p.x += ridge * uFlute;

    // liquid light field
    float s = field(p * 1.2, t) * uFlow;

    // broad flowing sheets of light + tight hot cores
    float b    = 0.5 + 0.5 * sin(s * 1.55 + t * 0.5);
    float glow = pow(b, 2.4);
    float core = pow(b, 8.0);
    float inten = glow * 1.05 + core * 0.55;

    // calmer toward the left, brighter toward the right
    inten *= mix(0.66, 1.08, smoothstep(0.0, 1.0, uv.x));

    // blue (left) -> magenta (right), pushed by the flow
    float ct = clamp(uv.x * 0.92 + 0.04 + 0.12 * s, 0.0, 1.0);
    vec3 col = palette(ct);
    col = mix(vec3(dot(col, vec3(0.299,0.587,0.114))), col, uSat);
    col = hueRotate(col, uHue);

    vec3 base = palette(ct) * 0.05;

    col = base + col * inten;
    col += core * core * vec3(1.0, 0.98, 1.0) * 1.05;

    // rib shading: seams + center glint
    float seam = uFluteShade * (ridge * ridge * 4.0);
    col *= (1.0 - seam);
    float spec = smoothstep(0.05, 0.0, abs(ridge));
    col += spec * uSpec * (inten + 0.15);

    // depth vignette
    float vig = smoothstep(1.45, 0.30, length((uv - 0.5) * vec2(aspect, 1.0)));
    col *= mix(0.88, 1.0, vig);

    col *= uBright * 1.25;

    // gentle filmic tone + grain
    col = col / (col + 0.85) * 1.85;
    float g = (hash(frag + fract(uTime) * 113.0) - 0.5) * (uGrain / 255.0) * 6.0;
    col += g;

    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }
`;

function compile(
  gl: WebGLRenderingContext,
  type: number,
  src: string
): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("[LiquidGlass] shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function LiquidGlassBackground(
  props: LiquidGlassBackgroundProps
) {
  const {
    className = "fixed inset-0 -z-10 h-screen w-screen",
    maxDpr = 1.75,
    respectReducedMotion = true,
    ...rest
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // live params — updated every render, read by the rAF loop without re-init
  const paramsRef = useRef<Params>({ ...DEFAULTS });
  paramsRef.current = { ...DEFAULTS, ...rest };

  const reducedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext("webgl", {
        antialias: false,
        alpha: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      }) as WebGLRenderingContext | null) ??
      (canvas.getContext("experimental-webgl", {
        preserveDrawingBuffer: true,
      }) as WebGLRenderingContext | null);

    if (!gl) {
      canvas.style.background =
        "linear-gradient(120deg,#05060d,#0a0a18 40%,#1a0a2a 70%,#2a0a2a)";
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U: Record<string, WebGLUniformLocation | null> = {};
    for (const n of [
      "uRes",
      "uTime",
      "uFlute",
      "uFluteShade",
      "uRibs",
      "uSpec",
      "uBright",
      "uScale",
      "uFlow",
      "uHue",
      "uSat",
      "uGrain",
    ]) {
      U[n] = gl.getUniformLocation(prog, n);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    // prefers-reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => (reducedRef.current = mq.matches);
    onMq();
    mq.addEventListener?.("change", onMq);

    let clock = 0;
    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = paramsRef.current;
      const speed =
        respectReducedMotion && reducedRef.current ? p.speed * 0.12 : p.speed;
      clock += dt * speed;

      resize();
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uTime, clock);
      gl.uniform1f(U.uFlute, p.flute);
      gl.uniform1f(U.uFluteShade, p.fluteShade);
      gl.uniform1f(U.uRibs, p.ribs);
      gl.uniform1f(U.uSpec, p.spec);
      gl.uniform1f(U.uBright, p.bright);
      gl.uniform1f(U.uScale, p.scale);
      gl.uniform1f(U.uFlow, p.flow);
      gl.uniform1f(U.uHue, p.hue);
      gl.uniform1f(U.uSat, p.saturation);
      gl.uniform1f(U.uGrain, p.grain);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      mq.removeEventListener?.("change", onMq);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      // NOTE: loseContext() é incompatível com React StrictMode (double-mount em dev),
      // pois marca o contexto como perdido permanentemente. O GC do navegador libera
      // o contexto naturalmente quando o <canvas> é removido do DOM.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxDpr, respectReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
    />
  );
}
