import type { RouteRecordRaw } from 'vue-router'

export const staticRoutes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: () => import('@/pages/auth/Login.vue'), meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/pages/dashboard/index.vue'), meta: { auth: true } },
  { path: '/diagram', name: 'Diagram', component: () => import('@/pages/diagram/index.vue'), meta: { auth: true } },
  { path: '/micro/vue2-app', name: 'Vue2Micro', component: () => import('@/pages/micro/Container.vue'), meta: { auth: true } },
]

export const dynamicRoutes: RouteRecordRaw[] = [
  // 后续可根据权限动态添加的路由
]