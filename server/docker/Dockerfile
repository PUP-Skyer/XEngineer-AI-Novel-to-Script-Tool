# ============================================
# 多阶段构建 Dockerfile
# ============================================

# ---- Stage 1: 依赖安装 ----
FROM node:20-alpine AS deps

WORKDIR /app

# 安装生产依赖和开发依赖 (用于构建)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ---- Stage 2: 构建 ----
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建 TypeScript
RUN npm run build

# 安装生产依赖
RUN npm ci --omit=dev --ignore-scripts

# ---- Stage 3: 生产运行 ----
FROM node:20-alpine AS runner

WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production

# 安装必要的系统包
RUN apk add --no-cache tini curl

# 创建非 root 用户
RUN addgroup -g 1001 -S asg && \
    adduser -S asg -u 1001

# 复制构建产物
COPY --from=builder --chown=asg:asg /app/dist ./dist
COPY --from=builder --chown=asg:asg /app/node_modules ./node_modules
COPY --from=builder --chown=asg:asg /app/package.json ./

# 切换到非 root 用户
USER asg

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 使用 tini 作为 PID 1
ENTRYPOINT ["/sbin/tini", "--"]

# 启动应用
CMD ["node", "dist/main"]
