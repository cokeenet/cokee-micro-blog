# Cokee.MicroBlog (轻量级社交微客平台)

本项目是一个基于前后端分离架构搭建的轻量级社交媒体平台。致力于打造一个专注碎片化内容分享的极简社交空间，支持动态发布、互动点赞、用户个人主页高度定制以及完善的管理端管控机制（JWT双端隔离）。

## 🛠 技术栈

### 前端 (Frontend)
- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: HeroUI v3 (React Aria Components)
- **CSS 框架**: Tailwind CSS v4

### 后端 (Backend)
- **框架**: C# .NET 9 + Minimal API
- **ORM**: Entity Framework Core (Code-First)
- **数据库**: MySQL 8.0+
- **鉴权**: JWT (JSON Web Token)

---

## 🚀 本地常规构建与运行 (Standard Build & Run)

适合本地深度开发调试，需在宿主机分别配置并运行前后端环境。

### 环境要求 (Prerequisites)
- [Node.js](https://nodejs.org/) (v18+ 推荐)
- [.NET 9 SDK](https://dotnet.microsoft.com/)
- MySQL Server (本地或远程实例)

### 1. 后端启动
1. 导航至后端目录：
   ```bash
   cd backend
   ```
2. 配置数据库连接：在 `Cokee.MicroBlog.Api/appsettings.json` 或 `appsettings.Development.json` 中配置你的 MySQL 数据库连接字符串。
3. 运行数据库迁移（初次启动前）：
   ```bash
   dotnet ef database update --project Cokee.MicroBlog.Infrastructure --startup-project Cokee.MicroBlog.Api
   ```
4. 启动后端 API 服务：
   ```bash
   dotnet run --project Cokee.MicroBlog.Api/Cokee.MicroBlog.Api.csproj
   # 或者使用热重载： dotnet watch --project Cokee.MicroBlog.Api/Cokee.MicroBlog.Api.csproj
   ```
   > 后端默认运行在: http://localhost:5000 或 https://localhost:5001 (以实际 launchSettings.json 为准)

### 2. 前端启动
1. 打开一个新的终端，导航至前端目录：
   ```bash
   cd frontend
   ```
2. 安装依赖包：
   ```bash
   npm install
   ```
3. 启动 Vite 开发服务器：
   ```bash
   npm run dev
   ```
   > 前端默认运行在: http://localhost:5173

---

## 🐳 Docker 容器化构建与运行 (Docker Compose - 推荐)

适合一键快速部署、系统预览与测试。该方案能彻底解决环境配置繁琐的问题，内置网络互通（Nginx/前端 + .NET API + MySQL）。

### 环境要求
- Docker
- Docker Compose

### 启动步骤
1. 在项目根目录（包含 `docker-compose.yml` 的目录）运行构建命令，打包所有镜像：
   ```bash
   docker-compose build
   ```
2. 使用分离模式后台启动所有微服务集群：
   ```bash
   docker-compose up -d
   ```
3. 等待数秒钟（数据库和后端初次启动需要一定时间加载与执行自动迁移），即可通过浏览器访问本地暴露的映射端口体验全站。

### 常用 Docker 管理指令
- **查看服务状态**：`docker-compose ps`
- **查看实时日志**：`docker-compose logs -f`
- **停止并销毁容器与网络**：`docker-compose down`

---

## 💡 项目设计亮点
1. **全栈双端打通**：囊括了面向普通用户的内容流展示，以及独立的 `/admin` 后台审查管理权限，严密的 JWT 安全校验隔离。
2. **现代化的 UI 质感**：前端极致利用 HeroUI v3 的前沿组件，兼顾骨架屏(Skeleton)、抽屉交互(Drawer)及优雅的动效反馈。
3. **彻底的跨域与编排解耦**：从开发环境的 Vite Proxy，到生产环境的 Docker Compose + Nginx 反代拓扑，优雅解决前后端分离协同的痛点。
