import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'builtin-modules'

const pkg = require('./package.json')

export default {
  input: './src/index.js',
  output: [
    { format: 'cjs', file: pkg.main, sourcemap: true, exports: 'default', interop: false },
    { format: 'es', file: pkg.module, sourcemap: true }
  ],
  external: builtins.concat(Object.keys(pkg.dependencies)),
  plugins: [
    buble({
      include: 'src/**',
      objectAssign: 'Object.assign',
      target: {
        node: 4
      }
    }),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      browser: false,
      preferBuiltins: true
    }),
    commonjs({
      include: 'node_modules/**'
    })
  ]
}
