const del = require('del')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const pkg = require('../package.json')

let promise = Promise.resolve()

let dependencies = Object.assign({}, pkg.dependencies || {}, pkg.peerDependencies || {})

// Clean up the output directory
promise = promise.then(() => del(['dist/*']))

const outputName = pkg.name

const exportName = 'MarionetteBehaviors'

const formats = ['es', 'umd']

// Compile source code into a distributable format with Babel
formats.forEach((format) => {
  promise = promise.then(() => rollup.rollup({
    input: 'src/index.js',
    external: Object.keys(dependencies),
    plugins: [babel({
      exclude: 'node_modules/**'
    })]
  }).then(bundle => bundle.write({
    file: `dist/${format === 'umd' ? outputName : outputName + '.esm'}.js`,
    format,
    sourcemap: true,
    name: format === 'umd' ? exportName : undefined,
    globals: {
      backbone: 'Backbone',
      'backbone.marionette': 'Marionette',
      'underscore': '_'
    }
  })))
})

promise.catch(err => {
  console.error(err.stack)
  process.exit(1)
}) // eslint-disable-line no-console
