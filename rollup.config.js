import buble from 'rollup-plugin-buble'
import inject from 'rollup-plugin-inject'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'builtin-modules'

const pkg = require('./package.json')

export default {
  input: 'src/index.js',
  output: [
    { format: 'cjs', file: 'index.js' },
    { format: 'es', file: 'index.es.js' }
  ],
  sourcemap: true,
  exports: 'default',
  external: builtins.concat(Object.keys(pkg.dependencies)),
  plugins: [
    buble({
      include: 'src/**',
      target: {
        node: 4
      },
      objectAssign: 'Object.assign'
    }),
    inject({
      Promise: 'bluebird'
    }),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      browser: false,
      preferBuiltins: true
    }),
    commonjs()
  ]
}
