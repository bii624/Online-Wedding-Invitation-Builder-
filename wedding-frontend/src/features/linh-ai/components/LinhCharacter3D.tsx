import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { EmotionState } from '../../../api/linhAiApi';

interface LinhCharacter3DProps {
  emotion: EmotionState;
  size?: number;
}

export function LinhCharacter3D({ emotion, size = 160 }: LinhCharacter3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    character: THREE.Group;
    head: THREE.Mesh;
    eyes: THREE.Mesh[];
    mouth: THREE.Mesh;
    hair: THREE.Mesh;
    animFrame: number;
    clock: THREE.Clock;
  } | null>(null);

  const emotionRef = useRef(emotion);
  emotionRef.current = emotion;

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;

    // ── Scene ──────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.5, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(size, size);
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);

    // ── Lighting ───────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xfff0f5, 1.2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffe0ec, 2);
    dirLight.position.set(2, 4, 3);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0xd4a0ff, 0.8);
    rimLight.position.set(-2, 1, -1);
    scene.add(rimLight);

    // ── Character group ────────────────────────
    const character = new THREE.Group();
    scene.add(character);

    // Skin tone
    const skinMat = new THREE.MeshPhongMaterial({ color: 0xf9d5b3 });
    const pinkMat = new THREE.MeshPhongMaterial({ color: 0xff85a1 });
    const whiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const darkMat = new THREE.MeshPhongMaterial({ color: 0x3a1a0a });
    const eyeMat = new THREE.MeshPhongMaterial({ color: 0x2c2c2c });
    const blushMat = new THREE.MeshPhongMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.5 });
    const dressMat = new THREE.MeshPhongMaterial({ color: 0xff6fa8 });
    const hairMat = new THREE.MeshPhongMaterial({ color: 0x1a0a05 });

    // Body (dress / torso)
    const bodyGeo = new THREE.CylinderGeometry(0.28, 0.42, 0.7, 12);
    const body = new THREE.Mesh(bodyGeo, dressMat);
    body.position.y = -0.55;
    character.add(body);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.18, 8);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = -0.11;
    character.add(neck);

    // Head
    const headGeo = new THREE.SphereGeometry(0.32, 32, 32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 0.2;
    character.add(head);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 0.27;
    hair.rotation.x = -0.1;
    character.add(hair);

    // Hair top bun / braid decoration
    const bunGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const bun = new THREE.Mesh(bunGeo, hairMat);
    bun.position.set(0, 0.56, 0.05);
    character.add(bun);

    // Hair ribbon
    const ribbonGeo = new THREE.TorusGeometry(0.08, 0.025, 8, 16);
    const ribbon = new THREE.Mesh(ribbonGeo, pinkMat);
    ribbon.position.set(0, 0.56, 0.14);
    ribbon.rotation.y = Math.PI / 2;
    character.add(ribbon);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1, 0.23, 0.28);
    character.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo.clone(), eyeMat);
    rightEye.position.set(0.1, 0.23, 0.28);
    character.add(rightEye);
    const eyes = [leftEye, rightEye];

    // Eye shine
    const shineGeo = new THREE.SphereGeometry(0.018, 8, 8);
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.1, 0.1].forEach((x) => {
      const shine = new THREE.Mesh(shineGeo, shineMat);
      shine.position.set(x + 0.015, 0.245, 0.33);
      character.add(shine);
    });

    // Blush
    const blushGeo = new THREE.CircleGeometry(0.06, 12);
    [-0.19, 0.19].forEach((x) => {
      const blush = new THREE.Mesh(blushGeo, blushMat);
      blush.position.set(x, 0.17, 0.3);
      character.add(blush);
    });

    // Mouth
    const mouthGeo = new THREE.TorusGeometry(0.05, 0.015, 8, 12, Math.PI);
    const mouth = new THREE.Mesh(mouthGeo, pinkMat);
    mouth.position.set(0, 0.1, 0.3);
    mouth.rotation.z = Math.PI;
    character.add(mouth);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.45, 8);
    const leftArm = new THREE.Mesh(armGeo, dressMat);
    leftArm.position.set(-0.35, -0.42, 0);
    leftArm.rotation.z = 0.4;
    character.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo.clone(), dressMat);
    rightArm.position.set(0.35, -0.42, 0);
    rightArm.rotation.z = -0.4;
    character.add(rightArm);

    // Scale up
    character.scale.set(1.1, 1.1, 1.1);
    character.position.y = -0.2;

    // ── Clock ──────────────────────────────────
    const clock = new THREE.Clock();

    // ── Animate ────────────────────────────────
    let animFrame = 0;
    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const em = emotionRef.current;

      // Base idle bob
      character.position.y = -0.2 + Math.sin(t * 2) * 0.025;

      if (em === 'happy') {
        // Gentle sway
        character.rotation.z = Math.sin(t * 2.5) * 0.06;
        head.rotation.z = Math.sin(t * 2.5) * 0.04;
        character.position.y = -0.2 + Math.sin(t * 3) * 0.04;
      } else if (em === 'excited') {
        // Enthusiastic bounce
        character.position.y = -0.2 + Math.abs(Math.sin(t * 5)) * 0.12;
        character.rotation.z = Math.sin(t * 5) * 0.1;
        head.rotation.y = Math.sin(t * 4) * 0.2;
      } else if (em === 'thinking') {
        // Head tilt + slow rock
        head.rotation.z = -0.25 + Math.sin(t * 1.5) * 0.05;
        character.rotation.z = Math.sin(t * 1.2) * 0.03;
        character.position.y = -0.2 + Math.sin(t * 1.5) * 0.015;
      } else {
        // neutral — calm breathing
        character.rotation.z = Math.sin(t * 1.2) * 0.02;
        head.rotation.z = 0;
        head.rotation.y = Math.sin(t * 0.8) * 0.05;
      }

      // Eye blink every ~3s
      const blinkPhase = (t % 3);
      const blinkScale = blinkPhase > 2.85 ? Math.max(0.1, 1 - (blinkPhase - 2.85) * 30) : 1;
      eyes.forEach((eye) => { eye.scale.y = blinkScale; });

      renderer.render(scene, camera);
    };

    animate();

    sceneRef.current = { renderer, scene, camera, character, head, eyes, mouth, hair, animFrame, clock };

    return () => {
      cancelAnimationFrame(animFrame);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size, display: 'inline-block', borderRadius: '50%', overflow: 'hidden' }}
    />
  );
}
