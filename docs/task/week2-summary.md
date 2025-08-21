# Week 2 任务总结：qiankun 接入与通信 + 部署

## 完成内容

本周我们完成了 qiankun 微前端框架的接入、通信机制的实现以及部署配置，主要包括以下内容：

### 1. qiankun 微前端框架集成

- 创建了 `src/qiankun/index.ts` 文件，实现了 qiankun 的核心封装
- 实现了子应用注册、启动和全局状态管理
- 配置了子应用的生命周期钩子函数
- 创建了 `src/qiankun/apps.ts` 文件，管理子应用配置

### 2. 子应用容器实现

- 在 `src/pages/micro/Container.vue` 中创建了子应用容器
- 优化了容器样式，提供更好的子应用展示效果
- 实现了子应用加载状态的处理

### 3. 全局状态通信机制

- 使用 qiankun 的 `initGlobalState` 实现主子应用通信
- 通过 props 下发 Pinia 全局 actions 到子应用
- 实现了用户认证信息的同步共享

### 4. Vercel 部署配置

- 创建了 `vercel.json` 文件，配置了部署规则
- 实现了 history 路由模式的重写规则
- 配置了 CORS 跨域资源共享头
- 设置了 GitHub 集成选项

### 5. GitHub Actions 自动部署工作流

- 创建了 `.github/workflows/deploy.yml` 文件
- 配置了基于 GitHub Actions 的 CI/CD 流程
- 实现了代码推送到 main 分支时自动构建和部署
- 配置了环境变量和 Vercel 部署令牌

### 6. 环境变量配置

- 创建了 `.env` 和 `.env.production` 文件
- 配置了开发环境和生产环境的不同变量
- 实现了 API 基础 URL 等配置的环境隔离

## 技术要点

1. **qiankun 微前端架构**
   - 应用注册与生命周期管理
   - 沙箱隔离机制
   - 全局状态共享

2. **跨应用通信**
   - 基于 qiankun actions 的通信机制
   - Pinia 状态同步到子应用

3. **CI/CD 自动化部署**
   - GitHub Actions 工作流配置
   - Vercel 部署集成
   - 环境变量管理

4. **路由与请求配置**
   - 前端路由重写规则
   - CORS 跨域资源共享
   - API 请求代理

## 部署流程

1. 代码推送到 GitHub 仓库的 main 分支
2. GitHub Actions 自动触发构建流程
3. 安装依赖并构建项目
4. 使用 Vercel Action 部署到 Vercel 平台
5. 应用在 Vercel 上线并可访问

## 遇到的问题与解决方案

1. **GitHub Actions 中 pnpm 安装顺序问题**
   - 问题：pnpm 安装失败，找不到 package.json
   - 解决：调整了 checkout 和 pnpm 安装的顺序，确保先检出代码再安装 pnpm

2. **Vercel 部署多分支问题**
   - 问题：PR 和其他分支也触发部署，造成资源浪费
   - 解决：配置 Vercel 只部署 main 分支，其他分支仅预览不部署

3. **子应用加载失败问题**
   - 问题：生产环境中子应用加载失败，出现跨域错误
   - 解决：在 vercel.json 中添加了正确的 CORS 头信息

## 下一步计划

1. 实现认证与权限骨架
2. 完善路由守卫与动态路由注入
3. 实现更细粒度的权限控制

## 总结

Week 2 的任务已全部完成，我们成功集成了 qiankun 微前端框架，实现了主子应用之间的通信机制，并配置了自动化部署流程。系统现在能够加载和管理子应用，并在不同环境中正确部署。这为后续的功能开发和应用集成奠定了坚实的基础。