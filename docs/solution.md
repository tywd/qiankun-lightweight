# 多技术栈前端应用整合管理方案文档

## 一、项目背景与目标

### 1. 背景

现有业务包含多个独立前端应用，技术栈分散（Vue2、Vue3、React 等），存在以下问题：



*   用户需切换多个域名访问不同应用，体验割裂；

*   各应用重复开发公共功能（如登录、权限），维护成本高；

*   技术栈迭代不同步，新功能复用难度大。

### 2. 目标



*   **统一入口**：通过主应用整合所有子应用，实现 “一站式” 访问；

*   **技术栈无关**：子应用保持原有技术栈，独立开发、独立部署；

*   **可扩展性**：支持新增子应用快速接入，后期可平滑升级至企业级架构；

*   **性能优化**：减少资源重复加载，提升页面切换与加载速度。

## 二、核心架构方案：微前端（Micro-Frontends）

### 1. 方案选型（按优先级推荐）



| 方案             | 核心特点                                         | 适用场景                        | 优势                  |
| -------------- | -------------------------------------------- | --------------------------- | ------------------- |
| qiankun（阿里）    | 基于 single-spa 封装，开箱即用；支持 JS 沙箱、CSS 隔离、自动资源加载 | 90% 企业级场景，尤其是对易用性、稳定性要求高的团队 | 零侵入改造、生态完善、文档丰富     |
| single-spa     | 微前端核心框架，仅提供应用注册、路由调度能力，需手动处理沙箱、资源加载          | 需深度定制微前端逻辑的场景（如自研沙箱）        | 轻量灵活、生态成熟（适配所有主流框架） |
| Web Components | 基于浏览器原生标准，子应用封装为自定义组件，天然 DOM / 样式隔离          | 子应用偏向 “组件化整合”（非完整应用）        | 原生隔离、技术栈无关          |

### 2. 架构核心逻辑



*   **主应用**：负责路由分发、子应用注册 / 挂载 / 卸载、全局状态管理、跨应用通信；

*   **子应用**：独立开发的业务应用，暴露生命周期钩子（`bootstrap`/`mount`/`unmount`），可独立运行；

*   **隔离机制**：JS 沙箱（避免全局变量污染）、CSS 隔离（动态前缀 / Shadow DOM）。

## 三、子应用改造要点

### 1. 暴露生命周期钩子

子应用需显式暴露微前端框架所需的生命周期，确保主应用可管理其启动、挂载、卸载：



```
// Vue2 子应用示例（src/main.js）

let instance = null;

// 渲染函数（支持独立运行/主应用加载）

function render(props = {}) {

&#x20; const { container } = props;

&#x20; instance = new Vue({

&#x20;   router,

&#x20;   render: h => h(App)

&#x20; }).\$mount(container ? container.querySelector('#app') : '#app');

}

// 独立运行时直接渲染

if (!window.\_\_POWERED\_BY\_QIANKUN\_\_) render();

// 暴露生命周期

export async function bootstrap() { /\* 初始化逻辑（仅首次执行） \*/ }

export async function mount(props) { render(props); /\* 接收主应用传参 \*/ }

export async function unmount() { instance.\$destroy(); /\* 清理避免内存泄漏 \*/ }
```

### 2. 打包配置：输出 UMD 格式

#### （1）UMD 定义

UMD（Universal Module Definition，通用模块定义）是兼容多种模块系统的格式，可让子应用在 “独立运行”“主应用加载”“Node 环境” 等场景下均能被正确识别（主应用通过全局变量访问子应用生命周期）。

#### （2）配置示例



```
// Vue2/Vue3：vue.config.js

module.exports = {

&#x20; output: {

&#x20;   libraryTarget: 'umd', // 输出 UMD 格式

&#x20;   library: 'vue2App',   // 暴露到 window 的变量名（需与主应用注册名一致）

&#x20;   globalObject: 'window'// 确保在浏览器环境下全局变量为 window

&#x20; }

};

// React：webpack.config.js

module.exports = {

&#x20; output: {

&#x20;   libraryTarget: 'umd',

&#x20;   library: 'reactApp',

&#x20;   globalObject: 'window'

&#x20; }

};
```

### 3. 动态设置 publicPath

解决 “子应用独立运行与主应用加载时资源路径冲突” 问题（避免 404）：



```
// Vue/React 子应用入口文件顶部添加

if (window.\_\_POWERED\_BY\_QIANKUN\_\_) {

&#x20; // 主应用注入的全局变量，指向子应用部署路径

&#x20; \_\_webpack\_public\_path\_\_ = window.\_\_INJECTED\_PUBLIC\_PATH\_BY\_QIANKUN\_\_;

}
```

### 4. 路由适配

为子应用路由添加基础路径，避免与主应用 / 其他子应用路由冲突：



```
// Vue2 路由示例（router/index.js）

const router = new VueRouter({

&#x20; mode: 'history',

&#x20; // 独立运行时 base 为 '/', 主应用加载时为子应用激活路径（如 '/vue2-app'）

&#x20; base: window.\_\_POWERED\_BY\_QIANKUN\_\_ ? '/vue2-app' : '/',

&#x20; routes

});

// React 路由示例（src/index.js）

\<BrowserRouter basename={window.\_\_POWERED\_BY\_QIANKUN\_\_ ? '/react-app' : '/'}>

&#x20; \<App />

\</BrowserRouter>
```

## 四、跨应用通信方案

按场景复杂度选择，**全局事件总线为中复杂场景的主流方案**：

### 1. 简单场景：Props 传递（推荐）



*   **适用**：主应用 → 子应用单向数据传递（如用户信息、权限）；

*   **优势**：轻量直观，无额外依赖；

*   **示例**：



```
// 主应用注册子应用时传参

registerMicroApps(\[

&#x20; {

&#x20;   name: 'vue2App',

&#x20;   entry: 'https://vue2-app.vercel.app',

&#x20;   container: '#subapp-container',

&#x20;   activeRule: '/vue2-app',

&#x20;   props: { user: { name: '张三' }, onLogin: () => console.log('登录回调') }

&#x20; }

]);

// 子应用 mount 时接收

export async function mount(props) {

&#x20; console.log('主应用传参：', props.user); // { name: '张三' }

}
```

### 2. 中复杂场景：全局事件总线（最常用）



*   **适用**：多向通信（主→子、子→主、子→子），如 “子应用 A 触发更新，子应用 B 同步数据”；

*   **实现**：用轻量事件库（`mitt`/`events`）挂载到主应用全局（沙箱外）；

*   **示例**：



```
// 主应用初始化事件总线（src/main.js）

import mitt from 'mitt';

window.eventBus = mitt(); // 所有子应用可访问

// 子应用A触发事件（组件内）

window.eventBus.emit('data-change', { id: 1 });

// 子应用B监听事件（入口文件）

window.eventBus.on('data-change', (data) => {

&#x20; console.log('收到数据变更：', data);

});
```

### 3. 复杂场景：全局状态管理



*   **适用**：多应用共享复杂状态（如全局配置、权限动态更新）；

*   **实现**：主应用维护全局状态（如 Pinia/Redux），暴露 `getState`/`setState` 方法；

*   **示例**：



```
// 主应用（Pinia 示例）

import { createPinia } from 'pinia';

const store = createPinia();

store.state.user = { name: '张三' };

// 暴露状态操作

window.globalStore = {

&#x20; getState: () => store.state.value,

&#x20; setState: (newState) => Object.assign(store.state.value, newState)

};

// 子应用使用

const user = window.globalStore.getState().user;

window.globalStore.setState({ user: { name: '李四' } });
```

## 五、构建与部署方案

### 1. 前期方案：Vercel + GitHub Actions（快速验证）

#### （1）可行性分析



*   **优势**：零服务器运维、自动构建部署、PR 预览隔离、全球 CDN 加速；

*   **适用**：初期业务验证，子应用数量 ≤ 10 的场景。

#### （2）实施步骤



1.  **子应用部署**：

*   Vercel 关联 GitHub 仓库，自动检测框架（Vue/React）；

*   配置构建命令（如 `npm run build`）与输出目录（如 `dist`）；

1.  **GitHub Actions 自动化**：



```
\# .github/workflows/deploy.yml

name: Deploy to Vercel

on: \[push]

jobs:

&#x20; deploy:

&#x20;   runs-on: ubuntu-latest

&#x20;   steps:

&#x20;     \- uses: actions/checkout@v4

&#x20;     \- uses: amondnet/vercel-action@v20

&#x20;       with:

&#x20;         vercel-token: \${{ secrets.VERCEL\_TOKEN }} # 从 Vercel 控制台获取

&#x20;         vercel-org-id: \${{ secrets.VERCEL\_ORG\_ID }}

&#x20;         vercel-project-id: \${{ secrets.VERCEL\_PROJECT\_ID }}
```



1.  **主应用配置**：注册子应用时，`entry` 指向 Vercel 部署地址（如 `https://vue2-app.vercel.app`）。

### 2. 后期企业级扩展方案

#### （1）容器化 + Kubernetes



*   **目标**：支持弹性扩缩容、灰度发布；

*   **步骤**：

1.  子应用打包为 Docker 镜像，推送到容器仓库（如 Docker Hub/GitHub Container Registry）；

2.  用 Helm/Kustomize 管理 Kubernetes 资源，通过 GitHub Actions 触发部署：



```
\# 构建并推送 Docker 镜像

\- name: Build & Push Docker Image

&#x20; run: |

&#x20;   docker build -t my-app:\${{ github.sha }} .

&#x20;   docker push my-app:\${{ github.sha }}

\# 部署到 Kubernetes

\- name: Deploy to K8s

&#x20; uses: azure/k8s-deploy@v1

&#x20; with:

&#x20;   namespace: production

&#x20;   manifests: k8s/deployment.yaml

&#x20;   image-name: my-app:\${{ github.sha }}
```

#### （2）配置中心集成



*   **目标**：动态更新子应用配置（如 `activeRule`、API 地址），无需重启；

*   **方案**：使用 Nacos/Apollo 存储配置，GitHub Actions 拉取配置注入子应用：



```
\# 从 Nacos 拉取配置

\- name: Fetch Config from Nacos

&#x20; run: |

&#x20;   curl -X GET "http://nacos.example.com/api/v1/cs/configs?dataId=subapp-config\&group=DEFAULT\_GROUP" \\

&#x20;     -H "X-Nacos-Token: \${{ secrets.NACOS\_TOKEN }}" > .env.production
```

#### （3）监控与日志



*   **性能监控**：集成 Sentry/Datadog 监控 JS 错误、API 响应时间；

*   **日志管理**：子应用日志接入 ELK/EFK 系统，集中分析排查问题。

## 六、主应用优化

### 1. 构建工具选型：Vite vs Webpack

#### （1）核心差异对比



| 维度     | Vite                   | Webpack            |
| ------ | ---------------------- | ------------------ |
| 开发环境   | ESM 原生加载（冷启动快、HMR 无感知） | 全量打包（冷启动慢，随体量线性变慢） |
| 生产环境   | Rollup 打包（产物体积小）       | 自身引擎（复杂优化配置更灵活）    |
| 生态     | 较新，部分旧插件需适配            | 极成熟，支持所有场景         |
| 大型项目适配 | 千级模块无压力，万级模块可能波动       | 超大型项目稳定性更优         |

#### （2）选型建议



*   **优先 Vite**：主应用为 “轻量壳工程”（仅子应用管理 + 公共功能），团队追求开发体验；

*   **选择 Webpack**：主应用承载复杂业务（如中台核心模块）、需兼容 IE 或依赖 Webpack 专属插件。

### 2. 主应用性能优化

#### （1）子应用预加载

主应用空闲时预加载子应用资源，减少切换等待时间：



```
// qiankun 主应用启动时配置

start({

&#x20; prefetch: 'all' // 预加载所有子应用（或 'need' 仅预加载可能访问的）

});
```

#### （2）共享公共依赖（webpack externals）

#### （1）定义

`externals` 是 Webpack/Vite 的配置项，用于**排除指定依赖不打包**，运行时从外部全局变量获取（如主应用加载的 CDN 资源），避免子应用重复加载。

#### （2）与 npm 包的区别



*   npm 包：子应用独立安装打包，可能多版本重复加载；

*   externals：主应用加载一次，所有子应用复用全局变量（如 `window.Vue`）。

#### （3）配置示例



```
\<!-- 主应用 public/index.html 引入 CDN 依赖 -->

\<script src="https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.min.js">\</script>

\<!-- 子应用配置 externals（vue.config.js） -->

module.exports = {

&#x20; configureWebpack: {

&#x20;   externals: {

&#x20;     vue: 'Vue' // 子应用 import Vue 时，实际使用 window.Vue

&#x20;   }

&#x20; }

};
```

#### （3）路由懒加载

主应用按路由分割代码，仅加载当前路由所需资源：



```
// Vue3 示例

const Home = () => import('./views/Home.vue');

const routes = \[

&#x20; { path: '/', component: Home },

&#x20; { path: '/vue2-app', component: () => import('./views/Vue2App.vue') }

];

// React 示例

const ReactApp = React.lazy(() => import('./views/ReactApp'));

function App() {

&#x20; return (

&#x20;   \<Suspense fallback={\<div>Loading...\</div>}>

&#x20;     \<Route path="/react-app" component={ReactApp} />

&#x20;   \</Suspense>

&#x20; );

}
```

## 七、实施建议与总结

### 1. 实施步骤



1.  **搭建主应用**：选择 Vite/Webpack 构建，集成 qiankun 框架；

2.  **改造现有子应用**：按 “生命周期→UMD→publicPath→路由” 顺序改造，确保可独立运行 + 主应用加载；

3.  **部署验证**：前期用 Vercel+GitHub Actions 部署，验证功能与通信；

4.  **扩展优化**：业务增长后，逐步接入容器化、配置中心、监控系统。

### 2. 核心结论



*   **架构选型**：优先 qiankun 微前端方案，平衡易用性与稳定性；

*   **部署策略**：前期 Vercel+GitHub Actions 快速验证，后期容器化扩展；

*   **主应用构建**：轻量壳工程选 Vite（开发体验优），复杂业务选 Webpack（稳定性强）；

*   **通信方案**：简单场景用 Props，中复杂场景用全局事件总线，复杂场景用全局状态管理。

> （注：文档部分内容可能由 AI 生成）