import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { threeToSoloNavMesh } from '@recast-navigation/three';
import { DebugDrawer } from '@recast-navigation/three/src/debug-drawer';
import React, { useEffect, useState } from 'react';
import { Group, Mesh } from 'three';
import { NavTestEnvironment } from '../../common/nav-test-environment';
import { decorators } from '../../decorators';
import { parameters } from '../../parameters';
import { NavMeshQuery } from '@recast-navigation/core';

export default {
  title: 'Debug / Three Debug Drawer',
  decorators,
  parameters,
};

const DebugDrawExample = {
  HEIGHTFIELD_SOLID: 'HEIGHTFIELD_SOLID',
  HEIGHTFIELD_WALKABLE: 'HEIGHTFIELD_WALKABLE',
  COMPACT_HEIGHTFIELD_SOLID: 'COMPACT_HEIGHTFIELD_SOLID',
  COMPACT_HEIGHTFIELD_REGIONS: 'COMPACT_HEIGHTFIELD_REGIONS',
  COMPACT_HEIGHTFIELD_DISTANCE: 'COMPACT_HEIGHTFIELD_DISTANCE',
  RAW_CONTOURS: 'RAW_CONTOURS',
  CONTOURS: 'CONTOURS',
  POLY_MESH: 'POLY_MESH',
  POLY_MESH_DETAIL: 'POLY_MESH_DETAIL',
  NAVMESH: 'NAVMESH',
  NAVMESH_BV_TREE: 'NAVMESH_BV_TREE',
};

type DebugDrawProps = {
  example: (typeof DebugDrawExample)[keyof typeof DebugDrawExample];
  showModel?: boolean;
};

const DebugDraw = ({ example, showModel = false }: DebugDrawProps) => {
  const [group, setGroup] = useState<Group | null>(null);

  const [debugDrawer, setDebugDrawer] = useState<DebugDrawer | undefined>();

  useEffect(() => {
    if (!group) return;

    const meshes: Mesh[] = [];

    group.traverse((child) => {
      if (child instanceof Mesh) {
        meshes.push(child);
      }
    });

    const config = {
      cs: 0.05,
      ch: 0.2,
      walkableHeight: 1,
      walkableClimb: 2.5,
      walkableRadius: 1,
      borderSize: 0.2,
    };

    const { success, navMesh, intermediates } = threeToSoloNavMesh(
      meshes,
      config,
      true
    );

    if (!success) return;

    const debugDrawer = new DebugDrawer();
    debugDrawer.resize(window.innerWidth, window.innerHeight);

    if (example === DebugDrawExample.HEIGHTFIELD_SOLID) {
      debugDrawer.debugDrawHeightfieldSolid(intermediates.heightfield!);
    } else if (example === DebugDrawExample.HEIGHTFIELD_WALKABLE) {
      debugDrawer.debugDrawHeightfieldWalkable(intermediates.heightfield!);
    } else if (example === DebugDrawExample.COMPACT_HEIGHTFIELD_SOLID) {
      debugDrawer.debugDrawCompactHeightfieldSolid(
        intermediates.compactHeightfield!
      );
    } else if (example === DebugDrawExample.COMPACT_HEIGHTFIELD_REGIONS) {
      debugDrawer.debugDrawCompactHeightfieldRegions(
        intermediates.compactHeightfield!
      );
    } else if (example === DebugDrawExample.COMPACT_HEIGHTFIELD_DISTANCE) {
      debugDrawer.debugDrawCompactHeightfieldDistance(
        intermediates.compactHeightfield!
      );
    } else if (example === DebugDrawExample.RAW_CONTOURS) {
      debugDrawer.debugDrawRawContours(intermediates.contourSet!, 1);
    } else if (example === DebugDrawExample.CONTOURS) {
      debugDrawer.debugDrawContours(intermediates.contourSet!, 1);
    } else if (example === DebugDrawExample.POLY_MESH) {
      debugDrawer.debugDrawPolyMesh(intermediates.polyMesh!);
    } else if (example === DebugDrawExample.POLY_MESH_DETAIL) {
      debugDrawer.debugDrawPolyMeshDetail(intermediates.polyMeshDetail!);
    } else if (example === DebugDrawExample.NAVMESH) {
      debugDrawer.debugDrawNavMesh(navMesh, 0);
    } else if (example === DebugDrawExample.NAVMESH_BV_TREE) {
      debugDrawer.debugDrawNavMeshBVTree(navMesh);
    }

    setDebugDrawer(debugDrawer);

    return () => {
      setDebugDrawer(undefined);

      navMesh?.destroy();
    };
  }, [group]);

  return (
    <>
      <group ref={setGroup} visible={showModel}>
        <NavTestEnvironment />
      </group>

      {debugDrawer && <primitive object={debugDrawer} />}

      <OrbitControls makeDefault />

      <PerspectiveCamera makeDefault position={[0, 10, 10]} />
    </>
  );
};

// Recast
export const _HeightfieldSolid = () => (
  <DebugDraw example={DebugDrawExample.HEIGHTFIELD_SOLID} />
);

export const _HeightfieldWalkable = () => (
  <DebugDraw example={DebugDrawExample.HEIGHTFIELD_WALKABLE} />
);

export const _CompactHeightfieldSolid = () => (
  <DebugDraw example={DebugDrawExample.COMPACT_HEIGHTFIELD_SOLID} />
);

export const _CompactHeightfieldRegions = () => (
  <DebugDraw example={DebugDrawExample.COMPACT_HEIGHTFIELD_REGIONS} />
);

export const _CompactHeightfieldDistance = () => (
  <DebugDraw example={DebugDrawExample.COMPACT_HEIGHTFIELD_DISTANCE} />
);

export const _RawContours = () => (
  <DebugDraw example={DebugDrawExample.RAW_CONTOURS} />
);

export const _Contours = () => (
  <DebugDraw example={DebugDrawExample.CONTOURS} />
);

export const _PolyMesh = () => (
  <DebugDraw example={DebugDrawExample.POLY_MESH} />
);

export const _PolyMeshDetail = () => (
  <DebugDraw example={DebugDrawExample.POLY_MESH_DETAIL} />
);

// Detour
export const _NavMesh = () => (
  <DebugDraw showModel example={DebugDrawExample.NAVMESH} />
);

export const _NavMeshBVTree = () => (
  <DebugDraw example={DebugDrawExample.NAVMESH_BV_TREE} />
);
