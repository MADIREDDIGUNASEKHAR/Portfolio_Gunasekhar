"use client";

/*
 * Three.js materials, buffer attributes and per-frame simulation state are mutable GPU-side
 * resources updated imperatively inside useFrame — the intended R3F pattern, which avoids
 * re-rendering React 60×/s. The React Compiler immutability rule doesn't model this.
 */
/* eslint-disable react-hooks/immutability */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { type ReactNode, type RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Theme } from "@/lib/theme";
import { mulberry32 } from "@/lib/utils";

/* ───────────── Palette ───────────── */

interface Palette {
  line: string;
  lineOpacity: number;
  node: string;
  hub: string;
  packet: string;
  dust: string;
  dustOpacity: number;
  coreBase: string;
  coreRim: string;
  coreAlpha: number;
  additive: boolean;
}

const PALETTES: Record<Theme, Palette> = {
  dark: {
    line: "#e6e9e1",
    lineOpacity: 0.11,
    node: "#7d837a",
    hub: "#c5f24a",
    packet: "#d8ff6a",
    dust: "#ffffff",
    dustOpacity: 0.32,
    coreBase: "#0b0d0b",
    coreRim: "#c5f24a",
    coreAlpha: 0.08,
    additive: true,
  },
  light: {
    line: "#1b1f19",
    lineOpacity: 0.14,
    node: "#6a7066",
    hub: "#2f6b0f",
    packet: "#2f6b0f",
    dust: "#20241e",
    dustOpacity: 0.28,
    coreBase: "#f4f2ec",
    coreRim: "#2f6b0f",
    coreAlpha: 0.3,
    additive: false,
  },
};

/* ───────────── Graph ───────────── */

interface Graph {
  nodes: THREE.Vector3[];
  hubs: Set<number>;
  edges: [number, number][];
  adj: number[][];
}

function buildGraph(count: number): Graph {
  const rand = mulberry32(7);
  const nodes = [new THREE.Vector3(0, 0, 0)]; // index 0 = core
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const radius = 2.25 + (rand() - 0.5) * 1.0;
    nodes.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius * 0.8, Math.sin(theta) * r * radius));
  }

  const hubs = new Set<number>();
  for (let i = 1; i < nodes.length; i += 7) hubs.add(i);

  const seen = new Set<string>();
  const edges: [number, number][] = [];
  const add = (a: number, b: number) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(k)) return;
    seen.add(k);
    edges.push([a, b]);
  };
  for (let i = 1; i < nodes.length; i++) {
    const nearest = nodes
      .map((n, j) => ({ j, d: j === i || j === 0 ? Infinity : n.distanceToSquared(nodes[i]) }))
      .sort((a, b) => a.d - b.d);
    for (let k = 0; k < 3; k++) add(i, nearest[k].j);
  }
  hubs.forEach((h) => add(0, h));

  const adj = nodes.map(() => [] as number[]);
  edges.forEach(([a, b]) => {
    adj[a].push(b);
    adj[b].push(a);
  });
  return { nodes, hubs, edges, adj };
}

/* ───────────── Shaders ───────────── */

const pointVertex = /* glsl */ `
  attribute float aSize;
  uniform float uPixelRatio;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (1.0 / -mv.z);
  }
`;

const pointFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.18, 0.0, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.45;
    float a = clamp(core + halo, 0.0, 1.0);
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a * uOpacity);
  }
`;

const fresnelVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fresnelFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uRim;
  uniform float uAlpha;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.0);
    vec3 col = mix(uBase, uRim, f * 0.85);
    gl_FragColor = vec4(col, uAlpha + f * 0.55);
  }
`;

function usePointsMaterial(color: string, opacity: number, additive: boolean, pixelRatio: number) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color() },
          uOpacity: { value: 1 },
          uPixelRatio: { value: 1 },
        },
        vertexShader: pointVertex,
        fragmentShader: pointFragment,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => {
    material.uniforms.uColor.value.set(color);
    material.uniforms.uOpacity.value = opacity;
    material.uniforms.uPixelRatio.value = pixelRatio;
    material.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    material.needsUpdate = true;
  }, [material, color, opacity, additive, pixelRatio]);
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

/* ───────────── Pointer ───────────── */

interface PointerState {
  x: number;
  y: number;
  energy: number;
}

function useWindowPointer() {
  const state = useRef<PointerState>({ x: 0, y: 0, energy: 1 });
  useEffect(() => {
    let lx = 0;
    let ly = 0;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      const speed = Math.hypot(x - lx, y - ly);
      lx = x;
      ly = y;
      state.current.x = x;
      state.current.y = y;
      state.current.energy = Math.min(4, state.current.energy + speed * 6);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return state;
}

/* ───────────── Scene parts ───────────── */

function Edges({ graph, palette }: { graph: Graph; palette: Palette }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(graph.edges.length * 6);
    graph.edges.forEach(([a, b], i) => {
      graph.nodes[a].toArray(arr, i * 6);
      graph.nodes[b].toArray(arr, i * 6 + 3);
    });
    return arr;
  }, [graph]);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={palette.line} transparent opacity={palette.lineOpacity} depthWrite={false} />
    </lineSegments>
  );
}

function Nodes({ graph, palette }: { graph: Graph; palette: Palette }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    graph.nodes.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.rotation.set(i * 0.7, i * 1.3, 0);
      dummy.scale.setScalar(i === 0 ? 0 : graph.hubs.has(i) ? 1.8 : 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.set(graph.hubs.has(i) ? palette.hub : palette.node));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [graph, palette]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, graph.nodes.length]}>
      <octahedronGeometry args={[0.026, 0]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function Packets({
  graph,
  count,
  palette,
  animate,
  pointer,
  pixelRatio,
}: {
  graph: Graph;
  count: number;
  palette: Palette;
  animate: boolean;
  pointer: RefObject<PointerState>;
  pixelRatio: number;
}) {
  const material = usePointsMaterial(palette.packet, 1, palette.additive, pixelRatio);
  const geo = useRef<THREE.BufferGeometry>(null);
  const rng = useMemo(() => mulberry32(99), []);

  const { packets, positions, sizes } = useMemo(() => {
    const r = mulberry32(11);
    const packets = Array.from({ length: count }, () => {
      const [from, to] = graph.edges[Math.floor(r() * graph.edges.length)];
      return { from, to, t: r(), speed: 0.35 + r() * 0.55 };
    });
    const positions = new Float32Array(count * 3);
    const sizes = Float32Array.from({ length: count }, () => 22 + r() * 26);
    packets.forEach((p, i) => {
      const a = graph.nodes[p.from];
      const b = graph.nodes[p.to];
      positions[i * 3] = a.x + (b.x - a.x) * p.t;
      positions[i * 3 + 1] = a.y + (b.y - a.y) * p.t;
      positions[i * 3 + 2] = a.z + (b.z - a.z) * p.t;
    });
    return { packets, positions, sizes };
  }, [graph, count]);

  useFrame((_, delta) => {
    if (!animate || !geo.current) return;
    const dt = Math.min(delta, 0.05);
    const energy = pointer.current?.energy ?? 1;
    for (let i = 0; i < packets.length; i++) {
      const p = packets[i];
      let a = graph.nodes[p.from];
      let b = graph.nodes[p.to];
      p.t += (dt * p.speed * energy) / Math.max(a.distanceTo(b), 0.4);
      if (p.t >= 1) {
        p.t -= 1;
        const nbrs = graph.adj[p.to];
        let next = nbrs[Math.floor(rng() * nbrs.length)];
        if (next === p.from && nbrs.length > 1) next = nbrs[(nbrs.indexOf(next) + 1) % nbrs.length];
        p.from = p.to;
        p.to = next;
        a = graph.nodes[p.from];
        b = graph.nodes[p.to];
      }
      positions[i * 3] = a.x + (b.x - a.x) * p.t;
      positions[i * 3 + 1] = a.y + (b.y - a.y) * p.t;
      positions[i * 3 + 2] = a.z + (b.z - a.z) * p.t;
    }
    geo.current.attributes.position.needsUpdate = true;
  });

  return (
    <points material={material} frustumCulled={false}>
      <bufferGeometry ref={geo}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
    </points>
  );
}

function Dust({
  count,
  palette,
  animate,
  pixelRatio,
}: {
  count: number;
  palette: Palette;
  animate: boolean;
  pixelRatio: number;
}) {
  const material = usePointsMaterial(palette.dust, palette.dustOpacity, palette.additive, pixelRatio);
  const ref = useRef<THREE.Points>(null);
  const { positions, sizes } = useMemo(() => {
    const r = mulberry32(3);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const radius = 3.2 + r() * 6;
      const theta = r() * Math.PI * 2;
      const phi = Math.acos(2 * r() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) * 0.7;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 2;
      sizes[i] = 6 + r() * 14;
    }
    return { positions, sizes };
  }, [count]);

  useFrame((_, delta) => {
    if (!animate || !ref.current) return;
    ref.current.rotation.y += Math.min(delta, 0.05) * 0.012;
  });

  return (
    <points ref={ref} material={material} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
    </points>
  );
}

function Ring({ radius, tilt, palette, speed, animate }: { radius: number; tilt: [number, number, number]; palette: Palette; speed: number; animate: boolean }) {
  const satellite = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const pts = new THREE.EllipseCurve(0, 0, radius, radius).getPoints(128);
    return new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, p.y, 0)));
  }, [radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!satellite.current) return;
    const t = animate ? state.clock.elapsedTime * speed : 1.2;
    satellite.current.position.set(Math.cos(t) * radius, Math.sin(t) * radius, 0);
  });

  return (
    <group rotation={tilt}>
      <lineLoop geometry={geometry}>
        <lineBasicMaterial color={palette.hub} transparent opacity={0.22} depthWrite={false} />
      </lineLoop>
      <mesh ref={satellite}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color={palette.hub} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Core({ palette, animate }: { palette: Palette; animate: boolean }) {
  const crystal = useRef<THREE.Mesh>(null);
  const cage = useRef<THREE.LineSegments>(null);
  const heart = useRef<THREE.Mesh>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uBase: { value: new THREE.Color() }, uRim: { value: new THREE.Color() }, uAlpha: { value: 0.4 } },
        vertexShader: fresnelVertex,
        fragmentShader: fresnelFragment,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => {
    material.uniforms.uBase.value.set(palette.coreBase);
    material.uniforms.uRim.value.set(palette.coreRim);
    material.uniforms.uAlpha.value = palette.coreAlpha;
  }, [material, palette]);

  const cageGeometry = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.08, 1)), []);
  useEffect(
    () => () => {
      material.dispose();
      cageGeometry.dispose();
    },
    [material, cageGeometry],
  );

  useFrame((state, delta) => {
    if (!animate) return;
    const dt = Math.min(delta, 0.05);
    if (crystal.current) {
      crystal.current.rotation.y += dt * 0.18;
      crystal.current.rotation.x += dt * 0.07;
    }
    if (cage.current) {
      cage.current.rotation.y -= dt * 0.08;
      cage.current.rotation.z += dt * 0.04;
    }
    if (heart.current) heart.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.12);
  });

  return (
    <group>
      <mesh ref={heart}>
        <icosahedronGeometry args={[0.11, 2]} />
        <meshBasicMaterial color={palette.hub} toneMapped={false} />
      </mesh>
      <mesh ref={crystal} material={material} renderOrder={2}>
        <icosahedronGeometry args={[0.78, 1]} />
      </mesh>
      <lineSegments ref={cage} geometry={cageGeometry}>
        <lineBasicMaterial color={palette.hub} transparent opacity={0.22} depthWrite={false} />
      </lineSegments>
      <Ring radius={1.5} tilt={[1.2, 0.25, 0]} palette={palette} speed={0.5} animate={animate} />
      <Ring radius={1.85} tilt={[1.75, -0.5, 0.4]} palette={palette} speed={-0.32} animate={animate} />
    </group>
  );
}

function Rig({ children, animate, pointer }: { children: ReactNode; animate: boolean; pointer: RefObject<PointerState> }) {
  const outer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const { size, viewport } = useThree();

  const isDesktop = size.width >= 1024;
  const isTablet = size.width >= 640 && size.width < 1024;
  const scale = isDesktop ? 0.92 : isTablet ? 0.85 : 0.68;
  const baseX = isDesktop ? viewport.width * 0.27 : 0;
  const baseY = isDesktop ? 0 : viewport.height * 0.16;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = pointer.current;
    if (p) p.energy = THREE.MathUtils.damp(p.energy, 1, 1.4, dt);
    if (spin.current && animate) spin.current.rotation.y += dt * 0.06;
    if (outer.current) {
      const tx = animate ? (p?.y ?? 0) * 0.22 : 0;
      const ty = animate ? (p?.x ?? 0) * 0.4 : 0;
      outer.current.rotation.x = THREE.MathUtils.damp(outer.current.rotation.x, -tx, 3, dt);
      outer.current.rotation.y = THREE.MathUtils.damp(outer.current.rotation.y, ty, 3, dt);
      const scrollShift = Math.min(window.scrollY / window.innerHeight, 1.5);
      outer.current.position.set(baseX, baseY + scrollShift * 1.4, 0);
    }
  });

  return (
    <group ref={outer} scale={scale}>
      <group ref={spin} rotation={[0.25, 0, 0.1]}>
        {children}
      </group>
    </group>
  );
}

/* ───────────── Root ───────────── */

export default function SystemsScene({
  theme,
  reducedMotion,
  isMobile,
  onReady,
}: {
  theme: Theme;
  reducedMotion: boolean;
  isMobile: boolean;
  onReady?: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState(() => Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio, isMobile ? 1.5 : 1.75));
  const pointer = useWindowPointer();
  const palette = PALETTES[theme];
  const graph = useMemo(() => buildGraph(isMobile ? 34 : 56), [isMobile]);
  const animate = visible && !reducedMotion;

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={container} className="absolute inset-0">
      <Canvas
        dpr={dpr}
        frameloop={animate ? "always" : "demand"}
        camera={{ position: [0, 0, 7.4], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={() => onReady?.()}
        aria-hidden
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <Rig animate={animate} pointer={pointer}>
          <Core palette={palette} animate={animate} />
          <Edges graph={graph} palette={palette} />
          <Nodes graph={graph} palette={palette} />
          <Packets
            graph={graph}
            count={isMobile ? 34 : 80}
            palette={palette}
            animate={animate}
            pointer={pointer}
            pixelRatio={dpr}
          />
        </Rig>
        <Dust count={isMobile ? 160 : 420} palette={palette} animate={animate} pixelRatio={dpr} />
      </Canvas>
    </div>
  );
}
