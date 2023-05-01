#!/bin/sh

# create directories
mkdir -p ./build
mkdir -p dist

# clone recast navigation library
[ ! -d "recastnavigation" ] && git clone https://github.com/isaac-mason/recastnavigation.git
(cd recastnavigation && git checkout c5cbd53024c8a9d8d097a4371215e3342d2fdc87)

# emscripten builds
emcmake cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build

# generate typescript definitions
yarn run webidl-dts-gen -e -d -i recast-navigation.idl -o ./dist/recast-navigation.d.ts -n Recast

# copy files to dist
cp ./build/recast-navigation.* ./dist/
