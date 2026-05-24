import { defineConfig } from 'vite';

export default defineConfig({
  base: '/null-pointer/',
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});