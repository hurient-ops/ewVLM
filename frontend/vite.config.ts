import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true, // 포트가 이미 사용 중일 경우, 다음 포트로 넘어가지 않고 오류를 발생시킵니다.
  },
});
