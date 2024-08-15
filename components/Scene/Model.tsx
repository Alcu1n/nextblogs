// components/Scene/Model.tsx
import React, { useRef } from 'react';
import { MeshTransmissionMaterial, useGLTF, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh } from 'three'; // 引入 Mesh 类型
import { useControls } from 'leva';

export default function Model() {
  const { nodes } = useGLTF('/static/L3DL2.glb');
  const { viewport } = useThree();
  const modelRef = useRef<Mesh>(null); // 定义 modelRef 为指向 Mesh 对象的引用

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += -0.008;
      modelRef.current.rotation.z += -0.008;
    }
  });

  const materialProps = useControls({
    thickness: { value: 0.2, min: 0, max: 3, step: 0.05 },
    roughness: { value: 0, min: 0, max: 1, step: 0.1 },
    transmission: { value: 1, min: 0, max: 1, step: 0.1 },
    ior: { value: 1.2, min: 0, max: 3, step: 0.1 },
    chromaticAberration: { value: 0.02, min: 0, max: 1 },
    backside: { value: true },
  });

  const scale = viewport.width < 10 ? viewport.width / 5 : viewport.width / 8.75;
  return (
    <group scale={scale}>
      <Text
        position={[-2, 1.2, 0]}
        fontSize={0.5}
        color="white"
        anchorX="left"
        anchorY="middle"
        maxWidth={5}
        style={{ fontFamily: 'Mukta' }}
      >
        莱
      </Text>
      {/* 第二行文字 */}
      <Text
        position={[-2, 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="left"
        anchorY="middle"
        maxWidth={6}
        style={{ fontFamily: 'Mukta' }}
      >
        前端 & LLM
      </Text>
      {/* 第二行文字 */}
      <Text
        position={[-2, -0.1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="left"
        anchorY="middle"
        maxWidth={4}
        style={{ fontFamily: 'Mukta' }}
      >
        Exploring the frontiers of AI and the web.
      </Text>
      <mesh ref={modelRef} {...nodes.Curve} position={[-0.5, 0, 0.5]}>
        <MeshTransmissionMaterial {...materialProps} />
      </mesh>
    </group>
  );
}

useGLTF.preload('/static/L3DL2.glb');
