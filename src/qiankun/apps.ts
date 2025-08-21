import type { RegistrableApp } from 'qiankun'
import { qiankunActions } from './index'

// 子应用配置列表
export const microApps: RegistrableApp<any>[] = [
  {
    name: 'vue2App',
    entry: import.meta.env.MODE === 'development' 
      ? 'http://localhost:7101' // 本地开发环境
      : 'https://vue2-app.vercel.app', // 线上环境
    container: '#subapp-container',
    activeRule: '/micro/vue2-app',
    props: {
      actions: qiankunActions,
      from: 'main-app',
      version: '1.0.0'
    }
  },
  // 可以添加更多子应用
  // {
  //   name: 'reactApp',
  //   entry: import.meta.env.MODE === 'development'
  //     ? 'http://localhost:7102'
  //     : 'https://react-app.vercel.app',
  //   container: '#subapp-container',
  //   activeRule: '/micro/react-app',
  //   props: { actions: qiankunActions }
  // }
]