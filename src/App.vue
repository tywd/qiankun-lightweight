<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/store/app'
import BasicLayout from './layouts/BasicLayout.vue'

const route = useRoute()
const appStore = useAppStore()
const isPublicPage = computed(() => route.meta?.public === true)

// 在应用挂载时应用保存的主题设置
onMounted(() => {
  const savedTheme = localStorage.getItem('app-theme')
  if (savedTheme === 'dark' || savedTheme === 'light') {
    appStore.theme = savedTheme
    document.documentElement.setAttribute('data-theme', savedTheme)
  }
})
</script>

<template>
  <!-- 公共页面（如登录）不使用布局 -->
  <template v-if="isPublicPage">
    <router-view />
  </template>
  
  <!-- 需要认证的页面使用基础布局 -->
  <template v-else>
    <BasicLayout>
      <router-view />
    </BasicLayout>
  </template>
</template>