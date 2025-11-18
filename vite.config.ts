import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: "/investment-tracker/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      // 可选：如果你使用 SCSS、Less，可以在这里配置变量全局导入
      // scss: {
      //   additionalData: `@import "@/styles/variables.scss";`
      // },
    },
  },
})
