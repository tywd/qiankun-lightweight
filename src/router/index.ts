import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes } from './routes'

const router = createRouter({
  history: createWebHistory('/'),
  routes: staticRoutes
})

export function setupRouter() {
  // 路由守卫可在此处添加
  router.beforeEach((to, _from, next) => {
    // 后续可添加认证与权限逻辑
    next()
  })
  
  return router
}

export default router