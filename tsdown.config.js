export default {
  target: 'es2018',
  entry: 'src/index.js',
  format: ['esm', 'cjs', 'iife'],
  minify: false,
  sourcemap: false,
  outputOptions: {
    name: 'CreaTenoxUI',
    banner: `//! latest build at: ${new Date()}`
  }
}
