import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Recast, NavMeshParameters } from 'recast-navigation/three';
import { Color, Group, Mesh, MeshBasicMaterial, Vector2, Vector3 } from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib';

const App = () => {
  const scene = useThree((state) => state.scene);

  const groupRef = useRef<Group>(null!);

  useEffect(() => {
    const recast = new Recast();

    recast.init().then(() => {
      const navMeshParameters: NavMeshParameters = {
        cs: 0.2,
        ch: 0.2,
        walkableSlopeAngle: 35,
        walkableHeight: 1,
        walkableClimb: 1,
        walkableRadius: 1,
        maxEdgeLen: 12,
        maxSimplificationError: 1.3,
        minRegionArea: 8,
        mergeRegionArea: 20,
        maxVertsPerPoly: 6,
        detailSampleDist: 6,
        detailSampleMaxError: 1,
      };

      const meshes: Mesh[] = [];

      groupRef.current.traverse((obj) => {
        if (obj instanceof Mesh) {
          meshes.push(obj);
        }
      });

      recast.buildNavMesh(meshes, navMeshParameters);

      const debugNavMesh = recast.createDebugNavMesh();

      debugNavMesh.material = new MeshBasicMaterial({
        color: 'red',
        wireframe: true,
      });

      scene.add(debugNavMesh);

      const path = recast.computePath(
        recast.getClosestPoint(new Vector3(2, 1, 2)),
        recast.getClosestPoint(new Vector3(-2, 1, -2))
      );
      console.log(path);

      const lineGeometry = new LineGeometry();
      lineGeometry.setPositions(path.flatMap((p) => [p.x, p.y, p.z]));
      lineGeometry.setColors(
        path.flatMap((_, idx) => {
          const color = new Color();
          color.setHSL(idx / path.length, 1, 0.5);
          return [color.r, color.g, color.b];
        })
      );

      const line = new Line2(
        lineGeometry,
        new LineMaterial({
          linewidth: 5, // in pixels
          vertexColors: true,
          resolution: new Vector2(window.innerWidth, window.innerHeight),
          dashed: true,
        })
      );

      scene.add(line);
    });
  }, []);

  return (
    <>
      <group ref={groupRef}>
        {/* ground */}
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[5, 0.5, 5]} />
          <meshStandardMaterial color="#ccc" />
        </mesh>

        {/* obstacle */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      </group>
    </>
  );
};

export default () => (
  <Canvas camera={{ position: [5, 5, 5] }}>
    <App />

    <Environment preset="city" />

    <OrbitControls />
  </Canvas>
);