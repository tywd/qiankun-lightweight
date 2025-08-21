import { defineStore } from 'pinia'
import type { RouteRecordRaw, Router } from 'vue-router'
import { dynamicRoutes } from '@/router/routes'

interface PermState {
  routesReady: boolean
  accessRoutes: RouteRecordRaw[]
  menuList: any[]
}

export const usePermStore = defineStore('perm', {
  state: (): PermState => ({
    routesReady: false,
    accessRoutes: [],
    menuList: []
  }),
  
  getters: {
    // 获取可访问的菜单列表
    getMenuList: (state) => state.menuList
  },
  
  actions: {
    /**
     * 构建用户可访问的路由
     * @param roles 用户角色
     * @param perms 用户权限
     */
    async buildRoutes(roles: string[], perms: string[]) {
      // 根据用户权限过滤动态路由
      this.accessRoutes = dynamicRoutes.filter(route => {
        // 如果路由没有设置权限要求，默认可访问
        if (!route.meta?.perms) return true
        
        // 检查用户是否拥有路由所需的所有权限
        const requiredPerms = route.meta.perms as string[]
        return requiredPerms.every(perm => perms.includes(perm))
      })
      
      // 构建菜单列表
      this.buildMenuList([...this.accessRoutes])
      
      this.routesReady = true
      return this.accessRoutes
    },
    
    /**
     * 将路由添加到路由器
     * @param router Vue Router 实例
     */
    addToRouter(router: Router) {
      this.accessRoutes.forEach(route => {
        if (!router.hasRoute(route.name as string)) {
          router.addRoute(route)
        }
      })
    },
    
    /**
     * 检查用户是否拥有指定权限
     * @param perms 需要检查的权限列表
     */
    hasPerms(perms: string[]) {
      const userPerms = useAuthStore().userPerms
      return perms.every(p => userPerms.includes(p))
    },
    
    /**
     * 构建菜单列表
     * @param routes 路由列表
     */
    buildMenuList(routes: RouteRecordRaw[]) {
      this.menuList = routes
        .filter(route => !route.meta?.hideInMenu) // 过滤不在菜单中显示的路由
        .map(route => {
          const { path, name, meta, children } = route
          const menuItem: any = {
            key: path,
            title: meta?.title || (name as string),
            icon: meta?.icon,
            children: children ? this.buildMenuList(children) : undefined
          }
          
          // 如果没有子菜单或子菜单为空，则删除 children 属性
          if (!menuItem.children || menuItem.children.length === 0) {
            delete menuItem.children
          }
          
          return menuItem
        })
      
      return this.menuList
    },
    
    /**
     * 重置权限状态
     */
    resetPermState() {
      this.routesReady = false
      this.accessRoutes = []
      this.menuList = []
    }
  }
})

// 导入 auth store 以避免循环依赖
import { useAuthStore } from './auth'