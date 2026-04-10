import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: false,
  // Bundle workspace packages since their main points to .ts source
  noExternal: ['@mandi/config', '@mandi/validators'],
})
