import type Recast from '@recast-navigation/wasm';
import { NavMeshCreateParams } from './detour';
import { NavMesh } from './nav-mesh';
import { Raw } from './raw';
import { vec3, Vector3 } from './utils';

export type ObstacleRef = Recast.dtObstacleRef;

export type BoxObstacle = {
  type: 'box';
  ref: ObstacleRef;
  position: Vector3;
  extent: Vector3;
  angle: number;
};

export type CylinderObstacle = {
  type: 'cylinder';
  ref: ObstacleRef;
  position: Vector3;
  radius: number;
  height: number;
};

export type Obstacle = BoxObstacle | CylinderObstacle;

export type TileCacheParamsType = {
  orig: ReadonlyArray<number>;
  cs: number;
  ch: number;
  width: number;
  height: number;
  walkableHeight: number;
  walkableRadius: number;
  walkableClimb: number;
  maxSimplificationError: number;
  maxTiles: number;
  maxObstacles: number;
};

export class DetourTileCacheParams {
  constructor(public raw: Recast.dtTileCacheParams) {}

  static create(config: TileCacheParamsType): DetourTileCacheParams {
    const tileCacheParams = new Raw.Module.dtTileCacheParams();

    tileCacheParams.set_orig(0, config.orig[0]);
    tileCacheParams.set_orig(1, config.orig[1]);
    tileCacheParams.set_orig(2, config.orig[2]);

    tileCacheParams.set_cs(config.cs);
    tileCacheParams.set_ch(config.ch);
    tileCacheParams.set_width(config.width);
    tileCacheParams.set_height(config.height);
    tileCacheParams.set_walkableHeight(config.walkableHeight);
    tileCacheParams.set_walkableRadius(config.walkableRadius);
    tileCacheParams.set_walkableClimb(config.walkableClimb);
    tileCacheParams.set_maxSimplificationError(config.maxSimplificationError);
    tileCacheParams.set_maxTiles(config.maxTiles);
    tileCacheParams.set_maxObstacles(config.maxObstacles);

    return new DetourTileCacheParams(tileCacheParams);
  }
}

export type TileCacheUpdateResult = {
  status: number;
  upToDate: boolean;
};

export class TileCache {
  raw: Recast.TileCache;

  obstacles: Map<ObstacleRef, Obstacle> = new Map();

  constructor(raw?: Recast.TileCache) {
    this.raw = raw ?? new Raw.Module.TileCache();
  }

  /**
   * Initialises the TileCache
   * @param params
   */
  init(
    params: DetourTileCacheParams,
    alloc: Recast.RecastLinearAllocator,
    compressor: Recast.RecastFastLZCompressor,
    meshProcess: TileCacheMeshProcess
  ) {
    return this.raw.init(params.raw, alloc, compressor, meshProcess.raw);
  }

  /**
   * Updates the tile cache by rebuilding tiles touched by unfinished obstacle requests.
   * This should be called after adding or removing obstacles.
   */
  update(navMesh: NavMesh): TileCacheUpdateResult {
    const { status, upToDate } = this.raw.update(navMesh.raw);

    return {
      status,
      upToDate,
    };
  }

  /**
   * Creates a cylinder obstacle and adds it to the navigation mesh.
   */
  addCylinderObstacle(
    position: Vector3,
    radius: number,
    height: number
  ): CylinderObstacle {
    const ref = this.raw.addCylinderObstacle(
      vec3.toRaw(position),
      radius,
      height
    );

    const obstacle: CylinderObstacle = {
      type: 'cylinder',
      ref,
      position,
      radius,
      height,
    };

    this.obstacles.set(ref, obstacle);

    return obstacle;
  }

  /**
   * Creates a box obstacle and adds it to the navigation mesh.
   */
  addBoxObstacle(
    position: Vector3,
    extent: Vector3,
    angle: number
  ): BoxObstacle {
    const ref = this.raw.addBoxObstacle(
      vec3.toRaw(position),
      vec3.toRaw(extent),
      angle
    );

    const obstacle: BoxObstacle = {
      type: 'box',
      ref,
      position,
      extent,
      angle,
    };

    this.obstacles.set(ref, obstacle);

    return obstacle;
  }

  /**
   * Removes an obstacle from the navigation mesh.
   */
  removeObstacle(obstacle: Obstacle | ObstacleRef): void {
    let ref: ObstacleRef;

    if (typeof obstacle === 'object') {
      ref = (obstacle as Obstacle).ref;
    } else {
      ref = obstacle;
    }

    this.obstacles.delete(ref);
    this.raw.removeObstacle(ref);
  }

  addTile(
    data: Recast.UnsignedCharArray,
    flags: number = Raw.Module.DT_COMPRESSEDTILE_FREE_DATA
  ): Recast.TileCacheAddTileResult {
    return this.raw.addTile(data, flags);
  }

  buildNavMeshTile(ref: Recast.dtCompressedTileRef, navMesh: NavMesh) {
    return this.raw.buildNavMeshTile(ref, navMesh.raw);
  }

  buildNavMeshTilesAt(tx: number, ty: number, navMesh: NavMesh) {
    return this.raw.buildNavMeshTilesAt(tx, ty, navMesh.raw);
  }

  destroy(): void {
    this.raw.destroy();
  }
}

export class TileCacheMeshProcess {
  raw: Recast.TileCacheMeshProcess;

  constructor(
    process: (
      navMeshCreateParams: NavMeshCreateParams,
      polyAreasArray: Recast.UnsignedCharArray,
      polyFlagsArray: Recast.UnsignedShortArray
    ) => void
  ) {
    this.raw = new Raw.Module.TileCacheMeshProcess();

    this.raw.process = ((
      paramsPtr: number,
      polyAreasArrayPtr: number,
      polyFlagsArrayPtr: number
    ) => {
      const params = new NavMeshCreateParams(
        Raw.Module.wrapPointer(paramsPtr, Raw.Module.dtNavMeshCreateParams)
      );

      const polyAreasArray = Raw.Module.wrapPointer(
        polyAreasArrayPtr,
        Raw.Module.UnsignedCharArray
      );

      const polyFlagsArray = Raw.Module.wrapPointer(
        polyFlagsArrayPtr,
        Raw.Module.UnsignedShortArray
      );

      process(params, polyAreasArray, polyFlagsArray);
    }) as never;
  }
}

export const buildTileCacheLayer = (
  comp: Recast.RecastFastLZCompressor,
  header: Recast.dtTileCacheLayerHeader,
  heights: Recast.UnsignedCharArray,
  areas: Recast.UnsignedCharArray,
  cons: Recast.UnsignedCharArray,
  tileCacheData: Recast.UnsignedCharArray
): number => {
  return Raw.DetourTileCacheBuilder.buildTileCacheLayer(
    comp,
    header,
    heights,
    areas,
    cons,
    tileCacheData
  );
};
