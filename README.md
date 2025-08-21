# qiankun-lightweight 微前端主应用

基于 Vue3 + Vite + TypeScript + qiankun 的微前端主应用框架，支持多技术栈子应用接入。

## 技术栈

- 框架：Vue 3 + TypeScript + Vite
- 路由：vue-router
- 状态管理：Pinia
- UI：ant-design-vue
- 图形：@antv/x6、echarts
- 微前端：qiankun
- 部署：Vercel

## 开发

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

## 子应用接入

1. 在 `src/qiankun/apps.ts` 中注册子应用：

```ts
export const microApps: MicroApp[] = [
  {
    name: 'appName',
    entry: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:端口号' 
      : '线上地址',
    container: '#subapp-container',
    activeRule: '/micro/app-path',
    props: { actions: qiankunActions }
  }
]
```

2. 子应用需要实现 qiankun 生命周期，详见 [docs/solution.md](docs/solution.md)

## 部署

项目已配置 Vercel 部署，只需将代码推送到 GitHub 仓库，并在 Vercel 中导入该仓库即可。

### Vercel 配置

- Build Command: `pnpm build`
- Output Directory: `dist`
- Install Command: `pnpm install`

## 环境变量

- `.env`: 开发环境配置
- `.env.production`: 生产环境配置

## 文档

- [开发计划](docs/plan.md)
- [微前端方案](docs/solution.md)
- [任务清单](docs/tasks.md)