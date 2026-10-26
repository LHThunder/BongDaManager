import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Phase 0 chưa có test nào; để lệnh test vẫn chạy được từ đầu.
    passWithNoTests: true,
  },
})
