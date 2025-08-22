import type { RegistrableApp } from 'qiankun'
import { qiankunActions } from './index'

// 子应用配置列表
export const microApps: RegistrableApp<any>[] = [
  // 暂时注释掉 vue2App 子应用，避免连接错误
  // {
  //   name: 'vue2App',
  //   entry: import.meta.env.MODE === 'development' 
  //     ? 'http://localhost:5174' // 本地开发环境
  //     : 'https://llm-chat-ty.vercel.app', // 线上环境（注意：移除了末尾的斜杠）
  //   container: '#subapp-container',
  //   activeRule: '/micro/vue2-app',
  //   props: {
  //     actions: qiankunActions,
  //     from: 'main-app',
  //     version: '1.0.0'
  //   }
  // },
  // AI News 子应用
  {
    name: 'ai-news-app',
    entry: import.meta.env.MODE === 'development'
      ? 'http://localhost:5175/' // 本地开发环境（使用当前运行的端口）
      : 'https://ai-news-app-two.vercel.app', // 线上环境（移除末尾的斜杠）
    container: '#subapp-container',
    activeRule: '/micro/ai-news-app',
    props: {
      actions: qiankunActions,
      from: 'main-app',
      version: '1.0.0',
      baseRoute: '/micro/ai-news-app', // 传递基础路由给子应用
      devMode: import.meta.env.MODE === 'development', // 传递开发模式标志
      // 添加额外的配置，用于处理生产环境中的MIME类型问题
      scriptAttrs: {
        type: 'application/javascript',
        crossorigin: 'anonymous'
      }
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