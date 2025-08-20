<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/app'
// 使用Ant Design Vue 4.x内置图标
import { MenuUnfoldOutlined, MenuFoldOutlined, BulbOutlined, DownOutlined, ApartmentOutlined, AppstoreOutlined, DashboardOutlined} from '@ant-design/icons-vue'

const appStore = useAppStore()
const route = useRoute()
const selectedKeys = ref<string[]>([])

// 根据当前路由更新菜单选中状态
watch(() => route.path, (path) => {
  const key = path.split('/')[1] || 'dashboard'
  selectedKeys.value = [`/${key}`]
}, { immediate: true })

const menuItems = [
  { key: '/dashboard', title: '仪表盘', icon: 'dashboard' },
  { key: '/diagram', title: '流程图', icon: 'apartment' },
  { key: '/micro/vue2-app', title: '子应用', icon: 'appstore' },
]
</script>

<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="appStore.collapsed" collapsible>
      <div class="logo">
        <img src="@/assets/logo.svg" alt="Logo" width="32" height="32" />
        <h1 v-if="!appStore.collapsed">管理系统</h1>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
      >
        <a-menu-item v-for="item in menuItems" :key="item.key">
          <template #icon>
            <DashboardOutlined v-if="item.icon === 'dashboard'" />
            <ApartmentOutlined v-else-if="item.icon === 'apartment'" />
            <AppstoreOutlined v-else-if="item.icon === 'appstore'" />
          </template>
          <router-link :to="item.key">
            <span>{{ item.title }}</span>
          </router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <a-row justify="space-between" align="middle">
          <a-col :span="12">
            <a-button
              type="text"
              @click="appStore.toggleCollapsed()"
              style="margin-left: 16px"
            >
              <template #icon>
                <MenuUnfoldOutlined v-if="appStore.collapsed" />
                <MenuFoldOutlined v-else />
              </template>
            </a-button>
          </a-col>
          <a-col :span="12" style="text-align: right; padding-right: 24px">
            <a-dropdown>
              <a-button type="text">
                管理员
                <DownOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile">个人信息</a-menu-item>
                  <a-menu-item key="settings">设置</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="logout">退出登录</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
            <a-button
              type="text"
              @click="appStore.toggleTheme()"
              style="margin-left: 8px"
            >
              <template #icon>
                <BulbOutlined />
              </template>
            </a-button>
          </a-col>
        </a-row>
      </a-layout-header>
      <a-layout-content style="margin: 16px">
        <div style="padding: 24px; background: #fff; min-height: 360px">
          <router-view></router-view>
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        管理系统 ©2025 Created by Team
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.logo {
  height: 32px;
  margin: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo h1 {
  color: white;
  margin: 0 0 0 12px;
  font-size: 18px;
  white-space: nowrap;
}
</style>