import './assets/main.css'
import './assets/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import { setupRouter } from './router'

// 创建应用实例
const app = createApp(App)

// 集成 Pinia
app.use(createPinia())

// 集成 Ant Design Vue
app.use(Antd)

// 集成路由
app.use(setupRouter())

// 挂载应用
app.mount('#app')

// 后续可在此处集成 qiankun
// import { setupQiankun } from './qiankun'
// setupQiankun([...])