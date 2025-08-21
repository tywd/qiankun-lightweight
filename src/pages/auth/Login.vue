<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'


const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const formRef = ref()

const formState = reactive({
  username: 'admin',
  password: 'admin123',
  remember: true
})

// 页面加载时检查是否有记住的用户名
onMounted(() => {
  const rememberedUsername = localStorage.getItem('remember_username')
  if (rememberedUsername) {
    formState.username = rememberedUsername
    formState.remember = true
  }
})

const handleSubmit = () => {
  formRef.value.validate().then(() => {
    loading.value = true
    // 模拟登录请求
    setTimeout(() => {
      if (formState.username === 'admin' && formState.password === 'admin123') {
        // 保存记住登录状态
        if (formState.remember) {
          localStorage.setItem('remember_username', formState.username)
        } else {
          localStorage.removeItem('remember_username')
        }
        
        authStore.setToken('mock-token-123456')
        authStore.setUser({
          id: '1',
          name: '管理员',
          roles: ['admin'],
          perms: ['view:dashboard', 'view:diagram', 'view:micro']
        })
        
        message.success('登录成功')
        const redirect = router.currentRoute.value.query?.redirect as string || '/dashboard'
        router.push(redirect)
      } else {
        message.error('用户名或密码错误')
      }
      loading.value = false
    }, 1000)
  }).catch((error: any) => {
    console.log('验证失败:', error)
  })
}

const resetForm = () => {
  formRef.value.resetFields()
}
</script>

<template>
  <div class="login-container">
    <a-card title="系统登录" style="width: 400px">
      <a-form
        ref="formRef"
        :model="formState"
        @finish="handleSubmit"
      >
        <a-form-item
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input v-model:value="formState.username" placeholder="用户名: admin">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password v-model:value="formState.password" placeholder="密码: admin123">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
          <a style="float: right">忘记密码</a>
        </a-form-item>

        <a-form-item>
          <div class="login-buttons">
            <a-button
              type="primary"
              html-type="submit"
              :loading="loading"
              style="width: 45%"
            >
              登录
            </a-button>
            <a-button style="width: 45%" @click="resetForm">
              重置
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.login-buttons {
  display: flex;
  justify-content: space-between;
}
</style>
