import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import builtins from 'builtin-modules'

export default defineConfig(({ mode }) => {
  // @ts-expect-error nodejs
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    build: {
      lib: {
        entry: 'src/main.ts',
        formats: ['cjs'],
      },
      rollupOptions: {
        external: [
          "obsidian",
          "electron",
          "@codemirror/autocomplete",
          "@codemirror/collab",
          "@codemirror/commands",
          "@codemirror/language",
          "@codemirror/lint",
          "@codemirror/search",
          "@codemirror/state",
          "@codemirror/view",
          "@lezer/common",
          "@lezer/highlight",
          "@lezer/lr",
          ...builtins
        ],
        output: {
          entryFileNames: '[name].js',
          assetFileNames: 'styles.css',
        },
      },
      sourcemap: mode === 'development' ? 'inline' : false,
      minify: mode === 'production',
      assetsDir: './',
      outDir: env.DIST_PATH || 'dist',
      emptyOutDir: true,
    },
  }
})
