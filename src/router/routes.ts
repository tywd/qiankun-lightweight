import type { RouteRecordRaw } from 'vue-router'

export const staticRoutes: RouteRecordRaw[] = [
  { 
    path: '/login', 
    name: 'Login', 
    component: () => import('@/pages/auth/Login.vue'), 
    meta: { 
      public: true,
      title: '登录' 
    } 
  },
  { 
    path: '/403', 
    name: 'Forbidden', 
    component: () => import('@/pages/error/403.vue'), 
    meta: { 
      public: true,
      title: '无权访问' 
    } 
  },
  { 
    path: '/404', 
    name: 'NotFound', 
    component: () => import('@/pages/error/404.vue'), 
    meta: { 
      public: true,
      title: '页面不存在' 
    } 
  },
  { path: '/', redirect: '/dashboard' },
]

export const dynamicRoutes: RouteRecordRaw[] = [
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: () => import('@/pages/dashboard/index.vue'), 
    meta: { 
      auth: true,
      title: '仪表盘',
      icon: 'dashboard',
      perms: ['view:dashboard'] 
    } 
  },
  { 
    path: '/diagram', 
    name: 'Diagram', 
    component: () => import('@/pages/diagram/index.vue'), 
    meta: { 
      auth: true,
      title: '流程图',
      icon: 'apartment',
      perms: ['view:diagram'] 
    } 
  },
  { 
    path: '/micro/vue2-app', 
    name: 'Vue2Micro', 
    component: () => import('@/pages/micro/Container.vue'), 
    meta: { 
      auth: true,
      title: 'Vue2子应用',
      icon: 'appstore',
      perms: ['view:micro'] 
    } 
  },
  { 
    path: '/micro/ai-news-app', 
    name: 'AiNewsMicro', 
    component: () => import('@/pages/micro/Container.vue'), 
    meta: { 
      auth: true,
      title: 'AI资讯',
      icon: 'robot',
      perms: ['view:micro'] 
    } 
  },
]

// 所有路由，包括静态和动态路由
export const allRoutes = [...staticRoutes, ...dynamicRoutes]

// 通配符路由，放在最后
export const notFoundRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  redirect: '/404'
}