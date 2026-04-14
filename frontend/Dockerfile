FROM node:20-alpine AS build
WORKDIR /app

# 安装依赖
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# 复制其它文件并构建
COPY frontend/ ./
RUN npm run build

# 部署在 Nginx 上
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
