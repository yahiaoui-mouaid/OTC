import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { BALL, EYE_L, EYE_R, EYE_R_SIZE, HEAD, LEGS, STANDING, STEM, TORSO } from '../lib/otto';

const CYAN = '#1BAFD1';
const PINK = '#E5537A';
const DEPTH = 90;
const lerp = THREE.MathUtils.damp;

function extrude(d: string, depth = DEPTH) {
  const shapes = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`).paths[0].toShapes();
  return new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: false, curveSegments: 20 });
}
function circle(r: number, depth = DEPTH * 0.6) {
  const s = new THREE.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2, false);
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 28 });
}

// Front faces use the exact brand flat colour, so OTTO still reads as the logo. Depth shows only on the walls.
function mats(color: string) {
  const c = new THREE.Color(color);
  return [
    new THREE.MeshBasicMaterial({ color: c, transparent: true }),
    new THREE.MeshStandardMaterial({ color: c.clone().multiplyScalar(0.62), roughness: 0.55, transparent: true }),
  ];
}

const pointer = { x: 0, y: 0 };

function Piece({ geo, m, position }: { geo: THREE.BufferGeometry; m: THREE.Material[]; position?: [number, number, number] }) {
  return <mesh geometry={geo} material={m} position={position} />;
}

function useParts(standing: boolean) {
  return useMemo(() => ({
    body: extrude(STANDING), torso: extrude(TORSO), legs: extrude(LEGS),
    head: extrude(HEAD), stem: extrude(STEM, DEPTH * 0.5), ball: circle(BALL[2]), eye: circle(EYE_R_SIZE),
    cyan: mats(CYAN), cyan2: mats(CYAN), cyan3: mats(CYAN), pink: mats(PINK), pink2: mats(PINK),
    standing,
  }), [standing]);
}

function Lights() {
  return <><hemisphereLight args={['#ffffff', '#335', 1.6]} /><directionalLight position={[-6, 8, 10]} intensity={2.6} /></>;
}

function FitCamera({ units }: { units: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    cam.zoom = size.height / units; cam.updateProjectionMatrix();
  }, [camera, size, units]);
  return null;
}

function HeroRig() {
  const p = useParts(true);
  const top = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (!top.current || !eyes.current) return;
    top.current.rotation.y = lerp(top.current.rotation.y, pointer.x * 0.62 + Math.sin(t * 0.7) * 0.04, 5, dt);
    top.current.rotation.x = lerp(top.current.rotation.x, pointer.y * 0.26, 5, dt);
    eyes.current.position.x = lerp(eyes.current.position.x, pointer.x * 16, 8, dt);
    eyes.current.position.y = lerp(eyes.current.position.y, pointer.y * 12, 8, dt);
  });
  // World units: 100 logo units = 1. Centre matches the SVG viewBox exactly, so the feet meet the band.
  return (
    <group scale={[0.01, -0.01, 0.01]} position={[-2.5, 4.83, 0]}>
      <Piece geo={p.body} m={p.cyan} position={[0, 0, -DEPTH]} />
      <group position={[250, 380, 0]}>
        <group ref={top}>
          <group position={[-250, -380, 0]}>
            <Piece geo={p.head} m={p.cyan2} position={[0, 0, -DEPTH]} />
            <Piece geo={p.stem} m={p.pink} position={[0, 0, -DEPTH * 0.75]} />
            <mesh geometry={p.ball} material={p.pink} position={[BALL[0], BALL[1], -DEPTH * 0.8]} />
            <group ref={eyes}>
              <mesh geometry={p.eye} material={p.pink2} position={[EYE_L[0], EYE_L[1], -DEPTH * 0.6]} />
              <mesh geometry={p.eye} material={p.pink2} position={[EYE_R[0], EYE_R[1], -DEPTH * 0.6]} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// step 0 Robotics: legs and torso. step 1 Computer science: head. step 2 Innovation: antenna.
const SPREAD = [
  { legs: -0.9, torso: -0.2, head: 0.5, spark: 1.0, yaw: -0.55 },
  { legs: -1.5, torso: -0.9, head: 0.15, spark: 0.9, yaw: 0.5 },
  { legs: -1.4, torso: -0.8, head: 0, spark: 1.9, yaw: -0.3 },
];

function ExplodeRig({ step }: { step: number }) {
  const p = useParts(false);
  const root = useRef<THREE.Group>(null);
  const legs = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const spark = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const s = SPREAD[step];
    const t = state.clock.elapsedTime;
    if (!root.current) return;
    root.current.rotation.y = lerp(root.current.rotation.y, s.yaw + pointer.x * 0.3 + Math.sin(t * 0.5) * 0.08, 3, dt);
    root.current.rotation.x = lerp(root.current.rotation.x, pointer.y * 0.14 + 0.08, 3, dt);
    const mv = (g: THREE.Group | null, y: number) => { if (g) g.position.y = lerp(g.position.y, y, 4, dt); };
    mv(legs.current, s.legs); mv(torso.current, s.torso); mv(head.current, s.head); mv(spark.current, s.spark);
    const fade = (list: THREE.Material[], on: boolean) => list.forEach((m) => { m.opacity = lerp(m.opacity, on ? 1 : 0.2, 5, dt); });
    fade(p.cyan, step === 0); fade(p.cyan2, step === 0); fade(p.cyan3, step === 1); fade(p.pink, step === 2); fade(p.pink2, step === 1);
  });
  const place = { scale: [0.01, -0.01, 0.01] as [number, number, number], position: [-2.5, 4.83, 0] as [number, number, number] };
  return (
    <group ref={root} scale={0.72}>
      <group ref={legs}><group {...place}><Piece geo={p.legs} m={p.cyan} position={[0, 0, -DEPTH / 2]} /></group></group>
      <group ref={torso}><group {...place}><Piece geo={p.torso} m={p.cyan2} position={[0, 0, -DEPTH / 2]} /></group></group>
      <group ref={head}><group {...place}>
        <Piece geo={p.head} m={p.cyan3} position={[0, 0, -DEPTH / 2]} />
        <mesh geometry={p.eye} material={p.pink2} position={[EYE_L[0], EYE_L[1], -DEPTH * 0.3]} />
        <mesh geometry={p.eye} material={p.pink2} position={[EYE_R[0], EYE_R[1], -DEPTH * 0.3]} />
      </group></group>
      <group ref={spark}><group {...place}>
        <Piece geo={p.stem} m={p.pink} position={[0, 0, -DEPTH / 4]} />
        <mesh geometry={p.ball} material={p.pink} position={[BALL[0], BALL[1], -DEPTH * 0.3]} />
      </group></group>
    </group>
  );
}

function usePointer() {
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, []);
}

type Props = { mode: 'hero' | 'explode'; step?: number; active: boolean; onReady?: () => void };

export default function Otto3D({ mode, step = 0, active, onReady }: Props) {
  usePointer();
  return (
    <Canvas
      flat orthographic dpr={[1, 2]} frameloop={active ? 'always' : 'never'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 50], near: 0.1, far: 200, zoom: 100 }}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
      aria-hidden="true"
    >
      <Lights />
      <FitCamera units={mode === 'hero' ? 11.94 : 13.5} />
      {mode === 'hero' ? <HeroRig /> : <ExplodeRig step={step} />}
    </Canvas>
  );
}
