import './assets/main.css'
import './assets/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import { setupRouter } from './router'
import { setupQiankun, setGlobalState } from './qiankun'
import { microApps } from './qiankun/apps'
import { useAuthStore } from './store/auth'

// 创建应用实例
const app = createApp(App)

// 集成 Pinia
const pinia = createPinia()
app.use(pinia)

// 集成 Ant Design Vue
app.use(Antd)

// 集成路由
app.use(setupRouter())

// 挂载应用
app.mount('#app')

// 集成 qiankun
setupQiankun(microApps)

// 将 Pinia 状态同步到 qiankun 全局状态
const authStore = useAuthStore()
// 监听 authStore 变化，同步到 qiankun 全局状态
authStore.$subscribe((mutation, state) => {
  setGlobalState({
    user: state.user,
    token: state.token
  })
})