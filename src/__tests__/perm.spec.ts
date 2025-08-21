import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePermStore } from '@/store/perm'
import { useAuthStore } from '@/store/auth'
import { dynamicRoutes } from '@/router/routes'
import { createRouter, createWebHistory } from 'vue-router'

// 模拟路由器
const mockRouter = {
  addRoute: vi.fn(),
  hasRoute: vi.fn().mockReturnValue(false)
}

// 创建测试用户数据
const testUser = {
  id: '1',
  name: '测试用户',
  roles: ['admin'],
  perms: ['view:dashboard', 'view:diagram']
}

describe('权限管理模块', () => {
  beforeEach(() => {
    // 创建一个新的 Pinia 实例并使其处于激活状态
    setActivePinia(createPinia())
    
    // 重置模拟函数
    vi.clearAllMocks()
    
    // 设置测试用户
    const authStore = useAuthStore()
    authStore.setToken('test-token')
    authStore.setUser(testUser)
  })

  it('应该根据用户权限过滤路由', async () => {
    const permStore = usePermStore()
    const accessRoutes = await permStore.buildRoutes(testUser.roles, testUser.perms)
    
    // 应该只包含用户有权限的路由
    expect(accessRoutes.length).toBe(2)
    expect(accessRoutes[0].path).toBe('/dashboard')
    expect(accessRoutes[1].path).toBe('/diagram')
    
    // 不应该包含用户没有权限的路由
    const microRoute = accessRoutes.find(route => route.path === '/micro/vue2-app')
    expect(microRoute).toBeUndefined()
  })

  it('应该将路由添加到路由器', async () => {
    const permStore = usePermStore()
    await permStore.buildRoutes(testUser.roles, testUser.perms)
    
    permStore.addToRouter(mockRouter as any)
    
    // 应该为每个可访问的路由调用 addRoute
    expect(mockRouter.addRoute).toHaveBeenCalledTimes(2)
  })

  it('应该正确检查用户权限', () => {
    const permStore = usePermStore()
    
    // 用户拥有的权限
    expect(permStore.hasPerms(['view:dashboard'])).toBe(true)
    expect(permStore.hasPerms(['view:dashboard', 'view:diagram'])).toBe(true)
    
    // 用户没有的权限
    expect(permStore.hasPerms(['view:micro'])).toBe(false)
    expect(permStore.hasPerms(['view:dashboard', 'view:micro'])).toBe(false)
  })

  it('应该正确构建菜单列表', async () => {
    const permStore = usePermStore()
    await permStore.buildRoutes(testUser.roles, testUser.perms)
    
    const menuList = permStore.getMenuList
    
    // 菜单列表应该包含用户有权限的路由
    expect(menuList.length).toBe(2)
    expect(menuList[0].key).toBe('/dashboard')
    expect(menuList[0].title).toBe('仪表盘')
    expect(menuList[1].key).toBe('/diagram')
    expect(menuList[1].title).toBe('流程图')
  })

  it('应该能够重置权限状态', async () => {
    const permStore = usePermStore()
    await permStore.buildRoutes(testUser.roles, testUser.perms)
    
    // 重置前应该有数据
    expect(permStore.routesReady).toBe(true)
    expect(permStore.accessRoutes.length).toBeGreaterThan(0)
    expect(permStore.menuList.length).toBeGreaterThan(0)
    
    // 重置权限状态
    permStore.resetPermState()
    
    // 重置后应该清空数据
    expect(permStore.routesReady).toBe(false)
    expect(permStore.accessRoutes.length).toBe(0)
    expect(permStore.menuList.length).toBe(0)
  })
})