import * as React from 'react'

// 简化的 ThemeProvider - 本项目暂不使用主题切换
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
