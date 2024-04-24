import RawModule from './raw-module';
import type { Pretty } from './types';

type ModuleKey = (keyof typeof RawModule)[][number];

const instances = [
  'Recast',
  'Detour',
  'DetourNavMeshBuilder',
  'DetourTileCacheBuilder',
  'NavMeshImporter',
  'NavMeshExporter',
  'CrowdUtils',
  'ChunkyTriMeshUtils',
  'RecastDebugDraw',
  'DetourDebugDraw',
] as const satisfies readonly ModuleKey[];

const classes = [
  'rcConfig',
  'rcContext',
  'dtNavMeshParams',
  'dtNavMeshCreateParams',
  'RecastLinearAllocator',
  'RecastFastLZCompressor',
  'rcChunkyTriMesh',
  'dtTileCacheParams',
  'dtTileCacheLayerHeader',
  'Vec3',
  'Vec2',
  'BoolRef',
  'IntRef',
  'UnsignedIntRef',
  'UnsignedCharRef',
  'UnsignedShortRef',
  'FloatRef',
  
] as const satisfies readonly ModuleKey[];

const arrays = [
  'IntArray',
  'UnsignedIntArray',
  'UnsignedCharArray',
  'UnsignedShortArray',
  'FloatArray',
] as const satisfies readonly ModuleKey[];

const arrayAliases = {
  VertsArray: 'FloatArray',
  TrisArray: 'IntArray',
  TriAreasArray: 'UnsignedCharArray',
  ChunkIdsArray: 'IntArray',
  TileCacheData: 'UnsignedCharArray',
} satisfies Record<string, (typeof arrays)[number]>;

type RawApi = Pretty<
  {
    Module: typeof RawModule;
    isNull: (obj: unknown) => boolean;
  } & {
    [K in (typeof instances)[number]]: InstanceType<(typeof RawModule)[K]>;
  } & {
    [K in (typeof classes)[number]]: (typeof RawModule)[K];
  }
>;

type Arrays = {
  [K in (typeof arrays)[number]]: (typeof RawModule)[K];
};

type ArrayAliases = {
  [K in keyof typeof arrayAliases]: (typeof RawModule)[(typeof arrayAliases)[K]];
};

type ArraysApi = Pretty<Arrays & ArrayAliases>;

export const Arrays = {} as ArraysApi;

/**
 * Lower level bindings for the Recast and Detour libraries.
 *
 * The `init` function must be called before using the `Raw` api.
 */
export const Raw = {
  isNull: (obj: unknown) => {
    return Raw.Module.getPointer(obj) === 0;
  },
} satisfies Partial<RawApi> as RawApi;

export const init = async () => {
  if (Raw.Module !== undefined) {
    return;
  }

  Raw.Module = await RawModule();

  for (const instance of instances) {
    (Raw as any)[instance] = new Raw.Module[instance]();
  }

  for (const clazz of classes) {
    (Raw as any)[clazz] = Raw.Module[clazz];
  }

  for (const array of arrays) {
    Arrays[array] = Raw.Module[array];
  }

  for (const [arrayAlias, target] of Object.entries(arrayAliases)) {
    Arrays[arrayAlias as keyof ArrayAliases] =
      Raw.Module[target as keyof Arrays];
  }
};
