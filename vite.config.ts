import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Phase 0 chưa có test nào; để lệnh test vẫn chạy được từ đầu.
    passWithNoTests: true,

    /*
      Bật xử lý CSS trong test để `import '../index.css?raw'` trả về nội dung
      thật. Mặc định của Vitest là trả chuỗi RỖNG, nên phép kiểm tương phản
      (T328) sẽ 'xanh' mà chẳng đo gì cả — đúng kiểu test tự trấn an mình.
      Không test nào khác nhập CSS, nên bật lên không tốn gì thêm.
    */
    css: true,
  },
})
