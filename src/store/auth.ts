import { defineStore } from 'pinia'

export interface UserInfo { 
  id: string
  name: string
  roles: string[]
  perms: string[] 
}

interface AuthState { 
  token: string
  user: UserInfo | null 
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({ 
    token: '', 
    user: null 
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRoles: (state) => state.user?.roles || [],
    userPerms: (state) => state.user?.perms || [],
  },
  actions: {
    setToken(token: string) { 
      this.token = token 
    },
    setUser(user: UserInfo | null) { 
      this.user = user 
    },
    logout() { 
      this.token = ''
      this.user = null 
    },
  },
})