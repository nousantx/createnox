import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/index.js',
  format: ['esm', 'cjs', 'iife'],
  target: 'es2018',
  minify: false,
  sourcemap: false,
  outputOptions: {
    name: 'createnox',
    footer: `//! build at: ${new Date()}`
  }
})
