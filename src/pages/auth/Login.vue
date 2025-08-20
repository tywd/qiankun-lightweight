<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { UserOutlined } from '@ant-design/icons-vue'


const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const formState = reactive({
  username: 'admin',
  password: 'admin123',
  remember: true
})

const handleSubmit = () => {
  loading.value = true
  // 模拟登录请求
  setTimeout(() => {
    authStore.setToken('mock-token-123456')
    authStore.setUser({
      id: '1',
      name: '管理员',
      roles: ['admin'],
      perms: ['view:dashboard', 'view:diagram', 'view:micro']
    })
    
    const redirect = router.currentRoute.value.query?.redirect as string || '/dashboard'
    router.push(redirect)
    loading.value = false
  }, 1000)
}
</script>

<template>
  <div class="login-container">
    <a-card title="系统登录" style="width: 400px">
      <a-form
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
          <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            block
          >
            登录
          </a-button>
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
</style>