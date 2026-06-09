# 🎭 AI 小说转剧本杀工具

> 将你的小说一键转换为沉浸式剧本杀剧本，自动生成角色设定、场景和对白。

AI 辅助剧本创作工具，降低小说改编剧本的门槛，提升效率。输入 3 个章节以上的小说文本，即可自动转换为结构化 YAML 格式剧本。

---

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| 🤖 **AI 小说生成** | 输入创意灵感，AI 自动创作完整小说 |
| 🎬 **小说 → 剧本转换** | 一键将小说转换为剧本杀剧本（YAML 格式） |
| 🎭 **角色自动设定** | 自动生成角色性格、背景、秘密、动机 |
| 💬 **对白生成** | 基于角色性格创作自然对白 + DM 旁白 |
| 🔀 **选择分支** | 关键场景设计选择分支，决定剧情走向 |
| 🎮 **多人在线剧本杀** | 实时多人联机游玩，支持 AI NPC |
| 📝 **YAML 剧本编辑器** | 三栏可视化编辑器，支持实时 YAML 预览 |

## 🏗️ 技术架构

```
ai-script-game/
├── apps/
│   ├── user-portal/     # React 用户前台（Vite + React 18 + TailwindCSS）
│   └── admin-portal/    # Vue 管理后台（Element Plus + Pinia）
├── packages/
│   └── shared/          # 共享类型定义
├── server/              # NestJS 后端
│   └── src/
│       ├── modules/
│       │   ├── auth/          # JWT 认证
│       │   ├── user/          # 用户管理
│       │   ├── novel/         # AI 小说生成
│       │   ├── script/        # 小说→剧本转换引擎
│       │   ├── game/          # 多人剧本杀引擎
│       │   ├── ai-model/      # AI 模型管理（OpenAI/Anthropic/DeepSeek）
│       │   ├── achievement/   # 成就与排行榜
│       │   ├── notification/  # 通知系统
│       │   └── social/        # 社交（评论/收藏/评分）
│       ├── queue/             # BullMQ 异步任务队列
│       └── common/            # 公共工具、守卫、拦截器
├── docker/              # Docker Compose（MySQL + Redis）
└── docs/                # 设计文档
```

## 📋 YAML 剧本 Schema

剧本以 YAML 格式输出，核心结构：

```yaml
metadata:
  title: "午夜庄园的秘密"
  player_count: { min: 4, max: 6 }
  difficulty: "medium"
  duration: "3小时"

characters:
  - id: "char_detective"
    name: "林探长"
    role: "protagonist"
    personality: "冷静、观察力敏锐"
    secret: "他认识死者，10年前有过一段交易"
    motivation: "查明真相，洗刷过去的耻辱"
    is_killer: false

scenes:
  - id: "scene_01"
    title: "暴风雨之夜"
    location: "庄园大厅"
    dialogues:
      - character_id: "char_dm"
        type: "narration_dm"
        content: "欢迎来到午夜庄园..."
      - character_id: "char_detective"
        type: "dialogue"
        content: "诸位，请把你们今晚的行踪都说一遍。"
        emotion: "严肃"
    choices:
      - id: "choice_01_a"
        text: "追问张少爷的不在场证明"
        target_scene_id: "scene_02_interrogate"
```

> 📖 完整 Schema 定义见 [`server/docs/yaml-schema-design.md`](server/docs/yaml-schema-design.md)

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- Docker（可选，用于数据库）

### 1. 安装依赖

```bash
git clone https://github.com/PUP-Skyer/XEngineer-AI-Novel-to-Script-Tool.git
cd XEngineer-AI-Novel-to-Script-Tool
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入你的配置
```

### 3. 启动数据库（可选）

```bash
pnpm docker:up
```

### 4. 启动开发服务器

```bash
# 启动用户前台
pnpm dev:user

# 启动管理后台
pnpm dev:admin

# 启动后端
pnpm dev:server

# 一键全部启动
pnpm dev:all
```

### 5. 演示模式

后端未启动时，登录页面输入**任意邮箱 + 密码 `12345678`** 即可进入演示模式。

## 🎨 页面预览

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | Hero 区域 + 核心功能 + 热门小说 |
| 小说陈列馆 | `/novels` | 搜索 + 类型筛选 + 排序 |
| AI 小说生成 | `/novels/create` | 提示词 + 参数配置 |
| 剧本转换 | `/scripts/convert/:id` | 4 阶段进度动画 |
| 剧本编辑器 | `/scripts/:id` | 角色面板 + 场景对白 + YAML 预览 |
| 游戏大厅 | `/game/lobby` | 创建/加入房间 |
| 排行榜 | `/leaderboard` | 热门小说 + 玩家排行 |

## 📦 技术栈

| 层级 | 技术 |
|------|------|
| **用户前台** | React 18 + TypeScript + Vite + TailwindCSS + Framer Motion |
| **管理后台** | Vue 3 + TypeScript + Element Plus + Pinia |
| **后端** | NestJS + TypeORM + JWT + Socket.IO |
| **数据库** | MySQL 8 + Redis + BullMQ |
| **AI** | OpenAI / Anthropic / DeepSeek（可插拔） |
| **编辑器** | Monaco Editor（YAML 实时预览） |
| **样式** | 霓虹赛博朋克暗色主题 🌃 |

## 📄 License

MIT

## 🎬 项目演示视频 

![项目演示视频](videos/AI小说转文字.mp4) 【AI小说转文字】https://www.bilibili.com/video/BV1nREM6VEms?vd_source=a087475a2dea025a32574e2a4aad3e67
![项目演示视频]补充版（补充版.mp4)
