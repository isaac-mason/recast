import { OrbitControls } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { Crowd, NavMesh } from '@recast-navigation/core';
import React, { useEffect, useState } from 'react';
import { threeToNavMesh } from 'recast-navigation/three';
import { Group, Mesh, Vector3 } from 'three';
import { ComplexEnvironment } from '../components/complex-environment';
import { Debug } from '../components/debug';
import { decorators } from '../decorators';
import { createLineMesh } from '../utils/create-line-mesh';

export default {
  title: 'Crowd',
  decorators,
};

export const SingleAgent = () => {
  const [group, setGroup] = useState<Group | null>(null);

  const [navMesh, setNavMesh] = useState<NavMesh | undefined>();
  const [crowd, setCrowd] = useState<Crowd | undefined>();

  const [agentTarget, setAgentTarget] = useState<Vector3 | undefined>();
  const [agentPathMesh, setAgentPathMesh] = useState<Mesh | undefined>();

  useEffect(() => {
    if (!group) return;

    const navMesh = threeToNavMesh(group, {
      cs: 0.05,
      ch: 0.2,
      walkableHeight: 1,
      walkableClimb: 2.5,
      walkableRadius: 1,
    });

    const crowd = new Crowd({ navMesh, maxAgents: 1, maxAgentRadius: 0.2 });

    crowd.addAgent(navMesh.getClosestPoint({ x: -2.9, y: 2.366, z: 0.9 }), {
      radius: 0.1,
      height: 0.5,
      maxAcceleration: 4.0,
      maxSpeed: 1.0,
      collisionQueryRange: 0.5,
      pathOptimizationRange: 0.0,
    });

    setNavMesh(navMesh);
    setCrowd(crowd);

    return () => {
      setNavMesh(undefined);
      setCrowd(undefined);
    };
  }, [group]);

  useFrame((_, delta) => {
    if (!crowd) return;

    crowd.update(delta);
  });

  useEffect(() => {
    if (!crowd) return;

    const interval = setInterval(() => {
      if (!crowd) return;

      if (!agentTarget) {
        setAgentPathMesh(undefined);
        return;
      }

      const path = [crowd.getAgentPosition(0), ...crowd.getAgentCorners(0)];

      if (path.length) {
        setAgentPathMesh(createLineMesh(path));
      } else {
        setAgentPathMesh(undefined);
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [crowd, agentTarget]);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!navMesh || !crowd) return;

    e.stopPropagation();

    const target = navMesh.getClosestPoint(e.point);

    if (e.button === 2) {
      crowd.teleport(0, target);

      setAgentTarget(undefined);
    } else {
      crowd.goto(0, target);

      setAgentTarget(new Vector3().copy(target as Vector3));
    }
  };

  return (
    <>
      {agentPathMesh && (
        <group position={[0, 0.2, 0]}>
          <primitive object={agentPathMesh} />
        </group>
      )}

      {agentTarget && (
        <group position={[0, 0, 0]}>
          <mesh position={agentTarget}>
            <sphereBufferGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="blue" />
          </mesh>
        </group>
      )}

      <group onPointerDown={onClick}>
        <group ref={setGroup}>
          <ComplexEnvironment />
        </group>
        <Debug navMesh={navMesh} crowd={crowd} />
      </group>

      <OrbitControls makeDefault />
    </>
  );
};

export const MultipleAgents = () => {
  const [group, setGroup] = useState<Group | null>(null);

  const [navMesh, setNavMesh] = useState<NavMesh | undefined>();
  const [crowd, setCrowd] = useState<Crowd | undefined>();

  useEffect(() => {
    if (!group) return;

    const navMesh = threeToNavMesh(group, {
      cs: 0.05,
      ch: 0.2,
      walkableHeight: 1,
      walkableClimb: 2.5,
      walkableRadius: 1,
    });

    const crowd = new Crowd({
      navMesh,
      maxAgents: 10,
      maxAgentRadius: 0.15,
    });

    for (let i = 0; i < 10; i++) {
      crowd.addAgent(navMesh.getRandomPointAround({ x: -2, y: 0, z: 3 }, 1), {
        radius: 0.1 + Math.random() * 0.05,
        height: 0.5,
        maxAcceleration: 4.0,
        maxSpeed: 1.0,
        collisionQueryRange: 0.5,
        pathOptimizationRange: 0.0,
        separationWeight: 1.0,
      });
    }

    setNavMesh(navMesh);
    setCrowd(crowd);

    return () => {
      crowd.destroy();
      navMesh.destroy();

      setNavMesh(undefined);
      setCrowd(undefined);
    };
  }, [group]);

  useFrame((_, delta) => {
    if (!crowd) return;

    crowd.update(delta);
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!navMesh || !crowd) return;

    const target = navMesh.getClosestPoint(e.point);

    for (const agent of crowd.getAgents()) {
      crowd.goto(agent, target);
    }
  };

  return (
    <>
      <group onClick={onClick}>
        <group ref={setGroup}>
          <ComplexEnvironment />
        </group>
      </group>

      <Debug navMesh={navMesh} crowd={crowd} />

      <OrbitControls />
    </>
  );
};
