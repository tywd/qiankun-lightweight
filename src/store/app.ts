import { defineStore } from 'pinia'

interface AppState {
  theme: 'light' | 'dark'
  collapsed: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    theme: 'light',
    collapsed: false
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      // 设置HTML的data-theme属性以应用相应的CSS变量
      document.documentElement.setAttribute('data-theme', this.theme)
      // 保存主题设置到localStorage
      localStorage.setItem('app-theme', this.theme)
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    }
  }
})

// 如果需要持久化存储，请安装并配置 pinia-plugin-persistedstate
// 然后在 main.ts 中注册插件
