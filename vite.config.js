import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => {
  const isSingleFile = process.env.VITE_SINGLEFILE === 'true';
  const base = process.env.BASE_PATH || './';

  const plugins = [react()];

  if (isSingleFile) {
    plugins.push(viteSingleFile());
  }

  return {
    base,
    build: {
      assetsInlineLimit: isSingleFile ? 100000000 : undefined,
    },
    plugins,
  };
});
