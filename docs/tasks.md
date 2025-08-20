# 开发任务清单 — 主应用（Vue3 + Vite + TS + qiankun）

版本：1.0  
说明：按周推进，每项包含任务、命令与脚手架代码片段。依赖使用 PNPM（可替换为 npm/yarn）。

---

## Week 1 基建与 UI 框架

任务
- 初始化依赖：vue-router、pinia、axios、ant-design-vue、echarts、@antv/x6、qiankun
- ESLint/Prettier 基础规范
- 基础布局（AntD：Sider/Menu/Header/Content），主题切换
- 路由与页面骨架

命令
```bash
# 基础依赖
pnpm add vue-router@4 pinia axios ant-design-vue echarts @antv/x6 qiankun mitt

# 类型与工具（可选）
pnpm add -D @types/node eslint prettier @antfu/eslint-config lint-staged husky

# 初始化 lint（按需）
echo 'export default { extends: ["@antfu"], rules: {} }' > eslint.config.js

# Husky & lint-staged（按需）
pnpm dlx husky-init && pnpm add -D lint-staged && sed -i '' 's/"test":.*/"test":"vitest"/' package.json || true
```

脚手架代码
```ts
// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router'
export const staticRoutes: RouteRecordRaw[] = [
  { path: '/login', component: () => import('@/pages/auth/Login.vue'), meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
]
export const dynamicRoutes: RouteRecordRaw[] = [
  { path: '/dashboard', component: () => import('@/pages/dashboard/index.vue'), meta: { auth: true, perms: ['view:dashboard'] } },
  { path: '/diagram', component: () => import('@/pages/diagram/index.vue'), meta: { auth: true, perms: ['view:diagram'] } },
  { path: '/micro/vue2-app', component: () => import('@/pages/micro/Container.vue'), meta: { auth: true, perms: ['view:micro'] } },
]
```

```ts
// src/store/auth.ts
import { defineStore } from 'pinia'
export interface UserInfo { id: string; name: string; roles: string[]; perms: string[] }
export const useAuthStore = defineStore('auth', {
  state: () => ({ token: '', user: null as UserInfo | null }),
  getters: { isAuthenticated: (s) => !!s.token },
  actions: { setToken(t: string){ this.token = t }, setUser(u: UserInfo | null){ this.user = u }, logout(){ this.token=''; this.user=null } }
})
```

```ts
// src/utils/request.ts
import axios from 'axios'
import { useAuthStore } from '@/store/auth'
const http = axios.create({ baseURL: import.meta.env.VITE_API_BASE || '/api', timeout: 15000 })
http.interceptors.request.use(cfg => {
  const auth = useAuthStore(); if (auth.token) cfg.headers.Authorization = `Bearer ${auth.token}`; return cfg
})
http.interceptors.response.use(res => res.data, err => { if (err?.response?.status === 401){ useAuthStore().logout(); location.href = '/login' } return Promise.reject(err) })
export default http
```

```ts
// src/main.ts（AntD + Pinia + Router）
import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes } from '@/router/routes'

const app = createApp(App)
app.use(Antd)
app.use(createPinia())
app.use(createRouter({ history: createWebHistory('/'), routes: staticRoutes }))
app.mount('#app')
```

---

## Week 2 qiankun 接入与通信

任务
- 新建 qiankun 封装：注册、start、initGlobalState
- 在 App.vue 预留子应用容器 #subapp-container
- 通过 props 下发 Pinia 全局 actions（或 qiankun actions）

命令
```bash
# 无额外依赖，已在 Week1 安装 qiankun
```

脚手架代码
```ts
// src/qiankun/index.ts
import { registerMicroApps, start, initGlobalState, MicroApp } from 'qiankun'
export type MfeState = { user: any | null; token: string }
export const actions = initGlobalState<MfeState>({ user: null, token: '' })

export function setupQiankun(apps: MicroApp[] = []) {
  registerMicroApps(apps, {
    beforeLoad: (app) => console.log('[mfe] before load', app.name),
    beforeMount: (app) => console.log('[mfe] before mount', app.name),
    afterUnmount: (app) => console.log('[mfe] after unload', app.name),
  })
  start({ prefetch: true, sandbox: { strictStyleIsolation: true }, singular: true })
}
```

```ts
// src/main.ts（节选：注册子应用）
import type { MicroApp } from 'qiankun'
import { setupQiankun, actions } from '@/qiankun'
const apps: MicroApp[] = [
  { name: 'vue2App', entry: 'http://localhost:7101', container: '#subapp-container', activeRule: '/micro/vue2-app', props: { actions } },
]
setupQiankun(apps)
```

```vue
<!-- src/App.vue（容器） -->
<template>
  <div id="subapp-container" style="height:100%"></div>
</template>
```

---

## Week 3 认证与权限骨架

任务
- 登录/注册页面，Pinia authStore、permStore
- 路由守卫与动态路由注入
- axios 拦截器联动 401 → 登出跳转

脚手架代码
```ts
// src/router/guards.ts
import type { Router } from 'vue-router'
import { useAuthStore } from '@/store/auth'
export function setupGuards(router: Router){
  router.beforeEach((to, _from, next) => {
    const auth = useAuthStore()
    if (to.meta?.public) return next()
    if (!auth.isAuthenticated) return next({ path: '/login', query: { redirect: to.fullPath } })
    next()
  })
}
```

---

## Week 4 ECharts 与 X6 集成

任务
- Dashboard：封装 useEcharts Hook，基础折线/柱状图
- Diagram：初始化 X6 画布与节点/边，导出 JSON

脚手架代码
```ts
// src/pages/dashboard/useEcharts.ts
import * as echarts from 'echarts'
import { ref, onMounted, onBeforeUnmount } from 'vue'
export function useEcharts(){
  const el = ref<HTMLElement | null>(null); let chart: echarts.ECharts | null = null
  onMounted(()=>{ if(el.value){ chart = echarts.init(el.value); chart.setOption({ xAxis:{type:'category',data:['Mon','Tue','Wed']}, yAxis:{type:'value'}, series:[{type:'line',data:[120,200,150]}] }) }})
  onBeforeUnmount(()=> chart?.dispose()); return { el }
}
```

```ts
// src/pages/diagram/initX6.ts
import { Graph } from '@antv/x6'
export function initGraph(container: HTMLElement){
  const graph = new Graph({ container, grid: true, panning: true })
  graph.addNode({ x: 40, y: 40, width: 100, height: 40, label: 'Node A' })
  graph.addNode({ x: 220, y: 180, width: 100, height: 40, label: 'Node B' })
  graph.addEdge({ source: { x: 90, y: 60 }, target: { x: 220, y: 200 } })
  return graph
}
```

---

## Week 5 部署与优化

任务
- Vercel 部署（主分支自动部署、PR Preview）
- history 路由重写（vercel.json）
- 评估 externals（CDN 注入 Vue/antdv/echarts/x6），按需开启
- 路由与页面懒加载

命令与配置
```bash
# Vercel CLI（可选）
pnpm add -D vercel
```

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## Week 6 测试与文档

任务
- 单元测试（Vitest），E2E（Playwright/Cypress）择一
- 完成 README、接入手册、排障文档

命令
```bash
pnpm add -D vitest @vitest/ui @vitejs/plugin-vue
# E2E 三选一
pnpm add -D playwright @playwright/test
# 或
pnpm add -D cypress
```

---

## 附：一次性安装命令（汇总）

```bash
pnpm add vue-router@4 pinia axios ant-design-vue echarts @antv/x6 qiankun mitt
pnpm add -D @types/node eslint prettier @antfu/eslint-config lint-staged husky vitest @vitest/ui
```

完成以上每周任务后，即可达成 docs/plan.md 中的验收标准与交付目标。