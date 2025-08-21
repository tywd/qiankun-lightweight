# 开发计划 — PC 管理端主应用（Vue3 + Vite + TS + qiankun）

版本：1.1  
读者：Owner、前端、测试、DevOps  
范围：主应用壳（认证/权限/路由/布局/通信/微前端注册/部署），子应用接入规范参见 docs/solution.md

---

## 1. 项目目标与非目标

目标
- 主应用壳：Vue3 + Vite + TypeScript + qiankun（托管与装载子应用）
- 统一认证：注册/登录、Token 生命周期、权限模型（RBAC）
- 路由与权限：vue-router 守卫、动态路由、菜单按权限渲染
- 全局通信：Pinia 作为全局状态源，向子应用暴露 get/set 接口（经 qiankun props）
- UI/图形：集成 ant-design-vue、@antv/x6、ECharts，提供 Demo 页
- 网络层：axios 实例（拦截器、错误处理、重试/取消）
- 部署：Vercel（主分支自动部署，Preview 环境基于 PR）

非目标
- 复杂报表引擎与低代码编辑器（留待后续）
- SSR 与多端适配（本期仅 PC 管理端）

---

## 2. 技术栈与版本建议

- 运行环境：Node ≥ 18、PNPM/Yarn/NPM 任一
- 框架与核心：Vue ^3.4、Vite ^5、TypeScript ^5、vue-router ^4、pinia ^2、qiankun ^2
- UI/图形：ant-design-vue ^4、@antv/x6 ^1、echarts ^5
- 网络：axios ^1
- 质量：ESLint（@antfu/eslint-config 或 Airbnb）、Prettier、lint-staged、Husky
- 测试（可选）：Vitest、Playwright/Cypress

---

## 3. 架构与模块划分

核心模块
1) auth：登录/注册/登出、token 管理、用户信息获取  
2) permission：RBAC 权限模型（role/permission）+ 路由/菜单控制  
3) router：静态基础路由 + 动态权限路由，前置/后置守卫  
4) store（Pinia）：authStore、appStore（布局/主题）、permStore（菜单/路由）  
5) ui：布局（Header/Sider/Content/Footer）、主题、导航、面包屑  
6) feature pages：Dashboard（ECharts）、Diagram（X6）  
7) http：axios 实例、统一错误、401/403 处理、刷新令牌（如需）  
8) microfrontends：qiankun 注册与生命周期、全局状态桥接、externals 策略  
9) devops：Vercel 部署、环境变量、CI（GitHub Actions 可选）

建议目录（主应用）
- src/
  - api/（接口定义、服务）
  - components/
  - layouts/（BasicLayout、AuthLayout）
  - pages/
    - auth/（Login/Register）
    - dashboard/（ECharts Demo）
    - diagram/（X6 Demo）
    - micro/（子应用容器页）
  - router/（routes.ts、guards.ts）
  - store/（auth.ts、app.ts、perm.ts、index.ts）
  - styles/（vars.css、theme.css）
  - utils/（request.ts、i18n.ts、storage.ts）
  - qiankun/（index.ts、apps.ts）
  - main.ts、App.vue

---

## 4. 里程碑与排期（6 周）

- 第1周：项目基建与 UI 框架
  - 集成 ant-design-vue、Pinia、vue-router、axios、ESLint/Prettier
  - 基础布局（Sider/Menu/Header/Content），暗黑/浅色切换
  - 输出：可跑模板与组件库就绪

- 第2周：qiankun 接入与通信 + 部署
  - 主应用 qiankun 注册、容器页、prefetch/沙箱/单例
  - Pinia 全局状态通过 props 暴露给子应用（get/set/subscribe）
  - Vercel 部署配置、环境变量、预览环境
  - vercel.json 配置（history 路由重写）
  - 输出：加载至少一个空子应用，状态通信有效，线上可访问

- 第3周：认证与权限骨架
  - 登录/注册页、authStore 设计、axios 拦截器
  - 路由守卫与动态路由、菜单按权限渲染
  - 输出：登录后可见不同菜单，未登录拦截

- 第4周：ECharts + X6 集成
  - Dashboard 图表页（折线/柱状/饼图）
  - Diagram 画布页（节点/边/交互/导出JSON）
  - 输出：两页功能 Demo

- 第5周：性能优化
  - 资源 externals（Vue/antdv/echarts/x6 按需评估）
  - 按路由懒加载、组件按需引入
  - 首屏加载优化、CDN 配置
  - 输出：首屏/切换性能达标

- 第6周：测试与文档
  - 单元/简易 E2E、错误链路覆盖
  - 完成 README、接入手册与排障文档
  - 输出：稳定可交付版本

人员建议：2 人并行（基础架构/认证路由 + UI图表/微前端）。  

---

## 5. 关键设计与代码片段

5.1 路由与守卫
```ts
// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router'

export const staticRoutes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: () => import('@/pages/auth/Login.vue'), meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
]

export const dynamicRoutes: RouteRecordRaw[] = [
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/pages/dashboard/index.vue'), meta: { auth: true, perms: ['view:dashboard'] } },
  { path: '/diagram', name: 'Diagram', component: () => import('@/pages/diagram/index.vue'), meta: { auth: true, perms: ['view:diagram'] } },
  { path: '/micro/vue2-app', name: 'Vue2Micro', component: () => import('@/pages/micro/Container.vue'), meta: { auth: true, perms: ['view:micro'] } },
]
```

```ts
// src/router/guards.ts
import type { Router } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { usePermStore } from '@/store/perm'

export function setupGuards(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const auth = useAuthStore()
    const perm = usePermStore()

    if (to.meta?.public) return next()

    if (!auth.isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    // 动态路由注入（仅一次）
    if (!perm.routesReady) {
      await perm.buildRoutes(auth.userRoles, auth.userPerms)
      perm.addToRouter(router)
      return next({ ...to, replace: true })
    }

    // 权限校验
    if (to.meta?.perms && !perm.hasPerms(to.meta.perms as string[])) {
      return next('/403')
    }

    next()
  })
}
```

5.2 Pinia 全局状态与权限
```ts
// src/store/auth.ts
import { defineStore } from 'pinia'

export interface UserInfo { id: string; name: string; roles: string[]; perms: string[] }
interface AuthState { token: string; user: UserInfo | null }

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({ token: '', user: null }),
  getters: {
    isAuthenticated: (s) => !!s.token,
    userRoles: (s) => s.user?.roles || [],
    userPerms: (s) => s.user?.perms || [],
  },
  actions: {
    setToken(t: string) { this.token = t },
    setUser(u: UserInfo | null) { this.user = u },
    logout() { this.token = ''; this.user = null },
  },
})
```

```ts
// src/store/perm.ts
import { defineStore } from 'pinia'
import type { Router, RouteRecordRaw } from 'vue-router'
import { dynamicRoutes } from '@/router/routes'

export const usePermStore = defineStore('perm', {
  state: () => ({ routesReady: false, accessRoutes: [] as RouteRecordRaw[] }),
  actions: {
    async buildRoutes(roles: string[], perms: string[]) {
      // 简化：基于 perms 过滤
      this.accessRoutes = dynamicRoutes.filter(r => {
        const need = (r.meta?.perms as string[]) || []
        return need.every(p => perms.includes(p))
      })
      this.routesReady = true
    },
    addToRouter(router: Router) {
      this.accessRoutes.forEach(r => router.addRoute(r))
    },
    hasPerms(need: string[]) {
      // 仅在已注入时调用；也可存储 perms 缓存
      return true
    },
  },
})
```

5.3 axios 实例与拦截
```ts
// src/utils/request.ts
import axios from 'axios'
import { useAuthStore } from '@/store/auth'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
})

instance.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) config.headers.Authorization = `Bearer ${auth.token}`
  return config
})

instance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err?.response?.status
    if (status === 401) {
      const auth = useAuthStore()
      auth.logout()
      location.href = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`
    }
    return Promise.reject(err)
  }
)

export default instance
```

5.4 ant-design-vue 引入
```ts
// src/main.ts（节选）
import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css' // v4

const app = createApp(App)
app.use(Antd)
app.mount('#app')
```
可选：unplugin-vue-components + AntDesignVueResolver 做按需引入。

5.5 ECharts 与 X6 示例
```ts
// src/pages/dashboard/useEcharts.ts
import * as echarts from 'echarts'
import { onMounted, onBeforeUnmount, ref } from 'vue'

export function useEcharts() {
  const el = ref<HTMLElement | null>(null)
  let chart: echarts.ECharts | null = null
  onMounted(() => {
    if (el.value) {
      chart = echarts.init(el.value)
      chart.setOption({ xAxis: { type: 'category', data: ['Mon','Tue','Wed'] }, yAxis: { type: 'value' }, series: [{ type: 'line', data: [120, 200, 150] }] })
    }
  })
  onBeforeUnmount(() => chart?.dispose())
  return { el }
}
```

```ts
// src/pages/diagram/initX6.ts
import { Graph } from '@antv/x6'

export function initGraph(container: HTMLElement) {
  const graph = new Graph({
    container,
    grid: true,
    panning: true,
  })
  graph.addNode({ x: 40, y: 40, width: 100, height: 40, label: 'Node A' })
  graph.addNode({ x: 220, y: 180, width: 100, height: 40, label: 'Node B' })
  graph.addEdge({ source: { x: 90, y: 60 }, target: { x: 220, y: 200 } })
  return graph
}
```

5.6 qiankun 接入与通信
```ts
// src/qiankun/index.ts（已存在：prefetch、strictStyleIsolation、singular、initGlobalState）
import { registerMicroApps, start, initGlobalState } from 'qiankun'

export const actions = initGlobalState({ user: null, token: '' })

export function setupQiankun() {
  registerMicroApps([
    {
      name: 'vue2App',
      entry: 'https://vue2-app.vercel.app',
      container: '#subapp-container',
      activeRule: '/micro/vue2-app',
      props: { actions }, // 暴露给子应用
    },
  ])
  start({ prefetch: true, sandbox: { strictStyleIsolation: true }, singular: true })
}
```

子应用通过 props.actions.onGlobalStateChange / setGlobalState 完成订阅与更新，详见 docs/solution.md。

5.7 共享依赖（可选 externals）
- 主应用通过 CDN 注入 Vue/ant-design-vue/echarts/x6，子应用通过 externals 复用，减少重复加载。
- 首期可不做，等子应用接入后按体积与冲突评估。

---

## 6. Vercel 部署与环境

- Build Command：pnpm build（或 npm run build）
- Output Directory：dist
- Environment Variables：
  - VITE_API_BASE=https://api.example.com
  - NODE_VERSION=18
- GitHub PR 自动生成 Preview URL
- vercel.json（可选）
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## 7. 验收标准（关键用例）

- 认证
  - 输入合法凭证可登录并落库 token，刷新后仍保持登录（如持久化）
  - 无权限路由不可访问且在菜单中不可见
- 路由/权限
  - 支持按权限动态注入路由，守卫可拦截未登录/无权限访问
- UI/交互
  - ant-design-vue 主题可切换，常用组件（Form/Table/Modal）可用
- ECharts/X6
  - Dashboard 正常渲染且随接口数据更新
  - Diagram 画布可新增/连线/删除并导出 JSON
- 网络
  - axios 拦截器可附加 token、对 401 做登出跳转
- 微前端
  - 能成功注册并装载子应用，切换无样式/JS 污染（CSS 隔离生效）
  - Pinia 全局状态可通知子应用并回传（actions.setGlobalState）
- 部署
  - main 分支推送自动触发 Vercel 部署，Preview 可访问

---

## 8. 风险与对策

- 依赖冲突：主/子应用版本不一致 → 约定版本白名单，必要时 externals
- 性能：首屏较重 → 路由懒加载、CDN、gzip/br、ECharts/X6 按需加载
- 权限复杂度：权限矩阵不清 → 先产出角色-资源-操作表，路由元信息单一来源
- X6 样式冲突：与 AntD 重叠 → 保持容器样式命名空间，必要时 Shadow DOM 承载
- 子应用故障：entry 不可达 → 主应用加兜底 UI 与重试提示

---

## 9. 当下待办（Next Actions）

- 安装依赖并初始化框架：ant-design-vue、pinia、vue-router、axios
- 搭建布局与登录页，打通登录→守卫→动态路由的最小闭环
- 创建 Dashboard 与 Diagram 页的基础 Demo
- 集成 qiankun 并以一个空子应用完成挂载与通信
- 配置 Vercel 项目与环境变量，完成首个线上预览

---

## 10. 参考

- 方案与接入规范：docs/solution.md
- vue-router 文档：https://router.vuejs.org/
- pinia 文档：https://pinia.vuejs.org/
- ant-design-vue 文档：https://www.antdv.com/
- ECharts 文档：https://echarts.apache.org/
- X6 文档：https://x6.antv.antgroup.com/
- qiankun 文档：https://qiankun.umijs.org/