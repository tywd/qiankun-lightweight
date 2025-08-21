<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="error-page">
    <a-result
      status="404"
      title="404"
      sub-title="抱歉，您访问的页面不存在"
    >
      <template #extra>
        <a-space>
          <a-button type="primary" @click="goHome">
            返回首页
          </a-button>
          <a-button @click="goBack">
            返回上一页
          </a-button>
        </a-space>
      </template>
    </a-result>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 500px;
}
</style>