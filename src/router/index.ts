import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes } from './routes'
import { useAuthStore } from '@/store/auth'
import { usePermStore } from '@/store/perm'

const router = createRouter({
  history: createWebHistory('/'),
  routes: staticRoutes
})

export function setupRouter() {
  // 路由守卫
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const permStore = usePermStore()
    
    // 白名单路由（不需要登录）直接放行
    if (to.meta?.public) {
      return next()
    }
    
    // 未登录，重定向到登录页
    if (!authStore.isAuthenticated) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
    
    // 已登录但路由未初始化，构建动态路由
    if (!permStore.routesReady) {
      try {
        // 根据用户角色和权限构建可访问路由
        await permStore.buildRoutes(
          authStore.userRoles,
          authStore.userPerms
        )
        
        // 将动态路由添加到路由器
        permStore.addToRouter(router)
        
        // 重定向到当前路由，让路由重新匹配（带上新增的动态路由）
        return next({ ...to, replace: true })
      } catch (error) {
        console.error('路由构建失败', error)
        authStore.logout()
        return next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }
    }
    
    // 检查页面访问权限
    if (to.meta?.perms) {
      const requiredPerms = to.meta.perms as string[]
      if (!permStore.hasPerms(requiredPerms)) {
        return next({ path: '/403' })
      }
    }
    
    // 通过所有检查，放行
    next()
  })
  
  return router
}

export default router