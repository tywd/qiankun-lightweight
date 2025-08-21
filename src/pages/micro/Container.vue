<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 子应用容器页面，用于挂载 qiankun 子应用
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')

// 监听子应用加载状态
onMounted(() => {
  // 确保容器存在
  const container = document.getElementById('subapp-container')
  if (!container) {
    console.error('[qiankun] Container #subapp-container not found')
    error.value = true
    errorMessage.value = '子应用容器未找到，请检查页面结构'
    return
  }
  
  window.addEventListener('qiankun:mounted', handleMounted)
  window.addEventListener('qiankun:failed', handleFailed)
  
  // 手动触发一次子应用加载（解决可能的路由问题）
  window.dispatchEvent(new CustomEvent('single-spa:routing-event'))
  
  // 检查子应用是否已经加载（可能在事件监听器设置前就已经加载完成）
  setTimeout(() => {
    // 检查子应用容器是否有内容
    if (container.childElementCount > 0) {
      handleMounted()
    } else {
      // 5秒后如果还在加载中，显示提示
      const timer = setTimeout(() => {
        if (loading.value) {
          errorMessage.value = '子应用加载时间较长，请检查网络或应用状态'
        }
      }, 5000)
      
      return () => {
        clearTimeout(timer)
      }
    }
  }, 100)
})

onBeforeUnmount(() => {
  window.removeEventListener('qiankun:mounted', handleMounted)
  window.removeEventListener('qiankun:failed', handleFailed)
})

function handleMounted() {
  loading.value = false
  error.value = false
}

function handleFailed(e: any) {
  loading.value = false
  error.value = true
  errorMessage.value = e?.detail?.message || '子应用加载失败'
}

// 重新加载页面的方法
function reloadPage() {
  window.location.reload()
}
</script>

<template>
  <div class="micro-container">
    <a-card 
      :title="loading ? '子应用加载中...' : (error ? '子应用加载失败' : '子应用')" 
      :bordered="false"
      class="container-card"
    >
      <template #extra>
        <a-tag v-if="loading" color="processing">加载中</a-tag>
        <a-tag v-else-if="error" color="error">加载失败</a-tag>
        <a-tag v-else color="success">运行中</a-tag>
      </template>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <a-spin tip="子应用加载中...">
          <div class="loading-content">
            <p>正在加载子应用，请稍候...</p>
            <p v-if="errorMessage" class="loading-tip">{{ errorMessage }}</p>
          </div>
        </a-spin>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <a-result
          status="error"
          title="子应用加载失败"
          :sub-title="errorMessage || '请检查子应用是否正常运行'"
        >
          <template #extra>
            <a-button type="primary" @click="reloadPage">
              重新加载
            </a-button>
          </template>
        </a-result>
      </div>
      
      <!-- qiankun 子应用将挂载到此处 -->
      <div id="subapp-container" class="subapp-container"></div>
    </a-card>
  </div>
</template>

<style scoped>
.micro-container {
  padding: 0;
  height: 100%;
}

.container-card {
  height: 100%;
}

.container-card :deep(.ant-card-body) {
  height: calc(100% - 57px); /* 减去卡片头部高度 */
  padding: 0;
  position: relative;
}

.subapp-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  background-color: #fafafa;
  transition: all 0.3s;
  position: relative;
  z-index: 1; /* 确保子应用容器在正确的层级 */
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.9);
}

.loading-content {
  text-align: center;
  margin-top: 20px;
}

.loading-tip {
  color: #faad14;
  font-size: 12px;
  margin-top: 8px;
}
</style>