const path = require('path');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const typescript = require('rollup-plugin-typescript2');

const pkg = require('./package.json');

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.ts'],
      moduleDirectories: ['node_modules']
    }),
    commonjs(),
    json(),
    typescript({
      useTsconfigDeclarationDir: true,
      clean: true,
      tsconfig: path.resolve(__dirname, 'tsconfig.json')
    })
  ],
  external: [
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.dependencies || {})
  ]
};

