// components/Scene/SceneCanvas.tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import Model from './Model';

export default function SceneCanvas() {
  return (
    <Canvas
      style={{
        background: 'transparent',
        width: '100%',
        height: '100%',
        position: 'absolute', // 确保 Canvas 是绝对定位的
        top: 0,
        left: 0,
        zIndex: -10, // 确保 Canvas 在页面的较低层级
        pointerEvents: 'none', // 确保 Canvas 不会阻止鼠标事件
      }}
    >
      <directionalLight intensity={2} position={[0, 2, 3]} />
      <Model />
      <Environment preset="dawn" />
    </Canvas>
  );
}
