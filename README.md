# recast-navigation-js

### Recast Navigation for JavaScript!

WASM + asm.js ports of [Recast Navigation](https://github.com/recastnavigation/recastnavigation), plus other goodies.

## Features

- 🌐 ‎ Support for web and node environments
- 💙 TypeScript support
- 🙆‍♀️ ‎ Multiple Emscripten builds (WASM, Inlined WASM, asm.js)
- 🖇 ‎ [Easy integration with three.js via @recast-navigation/three](https://github.com/isaac-mason/recast-navigation-js/tree/main/packages/recast-navigation-three)

## Packages

Functionality is spread across packages in the `@recast-navigation/*` organization, with the `recast-navigation` acting as an umbrella package.

You can choose between picking the scoped packages you need, or using the umbrella `recast-navigation` package, which provides additional entrypoints for specific frameworks and libraries.

Note that all packages ship as ESM, there is no support for CommonJS/UMD right now.

### [**`recast-navigation`**](https://github.com/isaac-mason/recast-navigation-js/tree/main/packages/recast-navigation)

[![Version](https://img.shields.io/npm/v/recast-navigation)](https://www.npmjs.com/package/recast-navigation)

The umbrella package for `recast-navigation`. Includes `@recast-navigation/core`, and `@recast-navigation/three`.

```bash
> yarn add recast-navigation
```

```ts
import createRecast from "recast-navigation";
import { NavMesh, Crowd } from "recast-navigation/three";

const Recast = await createRecast();
```

### [**`@recast-navigation/core`**](https://github.com/isaac-mason/recast-navigation-js/tree/main/packages/recast-navigation-core)

[![Version](https://img.shields.io/npm/v/@recast-navigation/core)](https://www.npmjs.com/package/@recast-navigation/core)

The core library!

```bash
> yarn add @recast-navigation/core
```

```ts
import createRecast from "@recast-navigation/core";

const Recast = await createRecast();
```

### [**`@recast-navigation/three`**](https://github.com/isaac-mason/recast-navigation-js/tree/main/packages/recast-navigation-three)

[![Version](https://img.shields.io/npm/v/@recast-navigation/three)](https://www.npmjs.com/package/@recast-navigation/three)

A Three.js integration for `@recast-navigation/core`.

```bash
> yarn add @recast-navigation/three
```

```ts
import { NavMesh, Crowd } from "@recast-navigation/three";
```

## Websites

### [NavMesh Generator](<[https://navmesh.isaacmason.com/](https://navmesh.isaacmason.com)>)

A website for generating navmeshes for your game. Drag 'n' drop your GLTF, fine tune your settings, and download your navmesh!

([source](./apps/navmesh-website/dist/))

### [Storybook - @recast-navigation/three](https://example.com/)

Various examples of how to use `@recast-navigation/three`.

([source](./packages/recast-navigation-three/.storybook))

### [Three.js + Vite Example](https://example.com/)

An example of using `@recast-navigation/three` with Three.js in a Vite project.

([source](./examples/vite-recast-navigation-three-example/))

## Development

### Project Structure

The repository is structured as a monorepo. You will find all packages inside `./packages`, examples in `./examples`, and deployed apps in `./apps`.

### Prerequisites
Before building, ensure you have the following installed:

- Python 3
- Emsdk v3.1.34

### Building

To build the project, run the following:

```sh
> yarn build
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgements

- This would not exist without [Recast Navigation](https://github.com/recastnavigation/recastnavigation) itself!
- The [Babylon.js Recast Extension](https://github.com/BabylonJS/Extensions/tree/master/recastjs) was used as a reference for the WASM build and the three.js extension.
