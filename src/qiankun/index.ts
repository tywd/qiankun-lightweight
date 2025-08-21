import { registerMicroApps, start, initGlobalState } from 'qiankun'
import type { RegistrableApp } from 'qiankun'

export type QiankunState = {
  user: any | null
  token: string
  [key: string]: any
}

export const qiankunActions = initGlobalState({
  user: null,
  token: '',
})

qiankunActions.onGlobalStateChange((state, prev) => {
  // 用于调试，主应用可在此处订阅并同步到 Pinia
  console.log('[qiankun] onGlobalStateChange', state, prev)
})

export function setupQiankun(apps: RegistrableApp<any>[] = []) {
  // apps 可以从配置文件或运行时注入
  registerMicroApps(
    apps,
    {
      beforeLoad: (app) => {
        console.log('[qiankun] before load', app.name)
        return Promise.resolve()
      },
      beforeMount: (app) => {
        console.log('[qiankun] before mount', app.name)
        return Promise.resolve()
      },
      afterUnmount: (app) => {
        console.log('[qiankun] after unload', app.name)
        return Promise.resolve()
      },
    }
  )

  start({
    prefetch: true,
    sandbox: { strictStyleIsolation: true },
    singular: true,
  })
}

export function setGlobalState(state: Partial<QiankunState>) {
  qiankunActions.setGlobalState(state)
}