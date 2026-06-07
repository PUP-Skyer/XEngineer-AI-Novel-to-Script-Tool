# 🧪 AI剧本杀游戏 - 测试计划与测试用例文档

> 本文档定义了项目的测试策略、测试范围、测试用例和测试执行计划。

---

## 一、测试总览

### 1.1 测试目标

| 目标 | 说明 |
|------|------|
| 功能正确性 | 确保所有核心功能按预期工作 |
| 状态机可靠性 | 确保游戏状态机各阶段正确流转 |
| API 完整性 | 确保所有 API 端点正确响应 |
| 前端交互 | 确保 UI 组件和用户交互正常 |
| 边界覆盖 | 覆盖异常情况和边界条件 |

### 1.2 测试框架

| 层级 | 框架 | 配置 |
|------|------|------|
| **单元测试** | Vitest | `vitest.config.ts` |
| **后端测试** | Jest | `server/test/jest-e2e.json` |
| **测试环境** | jsdom | 前端组件测试 |
| **覆盖率报告** | c8/istanbul | text + json + html |

### 1.3 测试目录结构

```
ai-script-game/
├── apps/user-portal/
│   └── src/
│       ├── services/
│       │   └── novelService.test.ts      # ✅ 已存在
│       ├── utils/
│       │   └── gameUtils.test.ts          # ✅ 已存在
│       └── test/
│           └── setup.ts                    # ✅ 已存在
├── server/
│   └── test/
│       └── jest-e2e.json                  # ✅ 已配置
└── (更多测试待补充)
```

---

## 二、已存在测试分析

### 2.1 novelService.test.ts (服务层测试)

| 测试用例 | 状态 | 覆盖内容 |
|----------|------|----------|
| `getList` 默认参数 | ✅ | 默认分页参数 page=1, pageSize=12 |
| `getList` 自定义参数 | ✅ | 自定义分页+筛选参数 |
| `update` 更新小说 | ✅ | PUT 请求 + 返回数据验证 |
| `delete` 删除小说 | ✅ | DELETE 请求 + 响应验证 |
| `toggleArchive` 存档切换 | ✅ | PATCH 请求 + 存档状态 |
| `getArchived` 获取已存档 | ✅ | 筛选+排序参数验证 |

### 2.2 gameUtils.test.ts (工具+逻辑测试)

| 测试用例 | 状态 | 覆盖内容 |
|----------|------|----------|
| 游戏阶段数量 | ✅ | 6个阶段验证 |
| 阶段顺序 | ✅ | lobby→character→manual→playing→ending→review |
| 阶段转换验证 | ✅ | 合法转换映射 |
| G-Coin奖励：≥90% | ✅ | 3倍基础奖励 |
| G-Coin奖励：≥70% | ✅ | 2倍基础奖励 |
| G-Coin奖励：≥50% | ✅ | 1倍基础奖励 |
| G-Coin奖励：<50% | ✅ | 0.5倍基础奖励 |
| 小说存档筛选 | ✅ | 只返回已存档 |
| 空存档列表 | ✅ | 无存档时返回空数组 |
| 转换阶段数量 | ✅ | 4个阶段 |
| 进度递增 | ✅ | 25→50→75→100 |
| 完成进度 | ✅ | 最终进度100% |

---

## 三、新增测试用例规划

### 3.1 游戏状态机引擎测试 (高优先级)

```typescript
// server/src/modules/game/engine/__tests__/game-engine.spec.ts

describe('GameEngine - 状态机核心引擎', () => {
  // --- 初始化测试 ---
  test('应正确初始化游戏会话，初始阶段为 LOBBY')
  test('应拒绝无效的玩家数量（<4 或 >8）')
  test('应正确分配角色给每位玩家')

  // --- 阶段转换测试 ---
  test('LOBBY → INTRO：所有玩家就绪后可进入')
  test('INTRO → READING：AI旁白播完后可进入')
  test('READING → DISCUSSION：所有玩家阅读完毕后可进入')
  test('DISCUSSION → ACCUSATION：讨论超时或所有玩家确认后可进入')
  test('ACCUSATION → VOTING：所有玩家完成指控后可进入')
  test('VOTING → REVEAL：所有玩家投票完成后可进入')
  test('REVEAL → ENDED：宣布结果后结束')
  
  // --- 边界条件测试 ---
  test('应正确处理阶段超时，自动推进到下一阶段')
  test('应拒绝不合法阶段转换（如 LOBBY → VOTING）')
  test('应正确处理玩家断线重连后的阶段同步')
  test('应处理所有玩家同时进入同一阶段的情况')

  // --- AI玩家测试 ---
  test('AI玩家应在讨论阶段自动发言')
  test('AI玩家应在投票阶段自动投票')
  test('AI玩家应基于角色性格做出合理决策')
})

describe('GameState - 状态对象', () => {
  test('应正确序列化和反序列化游戏状态')
  test('应能获取当前阶段的可执行操作列表')
  test('应记录阶段转换时间戳')
  test('应为每个阶段维护独立的超时计数器')
})
```

### 3.2 剧本转换引擎测试 (高优先级)

```typescript
// server/src/modules/script/converter/__tests__/converter.spec.ts

describe('NovelToScriptConverter - 剧本转换引擎', () => {
  // --- 核心转换测试 ---
  test('应正确解析小说文本中的角色信息')
  test('应将小说章节映射为剧本场景')
  test('应自动生成符合剧本 Schema 的 YAML 输出')
  test('应正确处理空文本输入，抛出合理错误')
  
  // --- 进度通知测试 ---
  test('应在 analyze 阶段发送 25% 进度通知')
  test('应在 extract 阶段发送 50% 进度通知')
  test('应在 generate 阶段发送 75% 进度通知')
  test('应在 polish 阶段发送 100% 完成通知')

  // --- Schema 校验测试 ---
  test('应通过 Zod Schema 校验生成的剧本结构')
  test('应检测缺少必填字段的情况')
  test('应检测角色数量超出限制的情况')
  test('应检测场景数量为空的情况')
})

describe('YamlGenerator - YAML 生成器', () => {
  test('应生成语法正确的 YAML')
  test('应正确处理特殊字符和换行符')
  test('应保持角色引用的一致性')
})

describe('YamlValidator - YAML 校验器', () => {
  test('应通过正确的剧本 YAML 校验')
  test('应拒绝缺少角色信息的 YAML')
  test('应拒绝格式错误的 YAML')
  test('应返回详细的校验错误信息')
})
```

### 3.3 用户认证测试 (中优先级)

```typescript
// server/src/modules/auth/__tests__/auth.spec.ts

describe('AuthService - 认证服务', () => {
  test('应使用 bcrypt 加密密码后存储')
  test('应在登录时正确验证密码')
  test('应生成有效的 JWT token')
  test('应拒绝无效的登录凭据')
  test('应拒绝重复注册（相同邮箱）')
  test('应正确处理 token 过期')

  test('JwtAuthGuard - 应允许有效的 token 通过')
  test('JwtAuthGuard - 应拒绝缺失 token 的请求')
  test('JwtAuthGuard - 应拒绝伪造的 token')
})

describe('RolesGuard - 角色守卫', () => {
  test('应允许具有正确角色的用户访问受保护路由')
  test('应拒绝不具有所需角色的用户')
})
```

### 3.4 AI 模型模块测试 (中优先级)

```typescript
// server/src/modules/ai-model/__tests__/ai-model.spec.ts

describe('BaseAiProvider - AI 模型提供者', () => {
  test('OpenAI 提供者应正确构造请求')
  test('Anthropic 提供者应正确构造请求')
  test('DeepSeek 提供者应正确构造请求')
  test('应为所有提供者实现统一的 complete 接口')
  test('应为所有提供者实现统一的 stream 接口')
})

describe('FallbackStrategy - 降级策略', () => {
  test('主模型失败时自动切换到备用模型')
  test('所有模型失败时抛出友好错误')
  test('应记录模型切换的日志')
})
```

### 3.5 社交系统测试 (中优先级)

```typescript
// server/src/modules/social/__tests__/social.spec.ts

describe('CollectionService - 收藏服务', () => {
  test('用户应能收藏小说')
  test('用户应能取消收藏')
  test('应防止重复收藏')
  test('应返回用户收藏列表')
})

describe('CommentService - 评论服务', () => {
  test('用户应能对小说发表评论')
  test('用户应能删除自己的评论')
  test('应防止空评论提交')
  test('应分页返回评论列表')
})

describe('RatingService - 评分服务', () => {
  test('用户应能对小说评分 (1-5)')
  test('应更新小说的平均评分')
  test('应防止评分超出范围')
  test('用户只能评分一次，再次评分更新原评分')
})

describe('Leaderboard - 排行榜', () => {
  test('应只返回已存档的小说')
  test('应按评分降序排列')
  test('应支持分页')
  test('应包含正确的跳转链接')
})
```

### 3.6 前端交互测试 (中优先级)

```typescript
// apps/user-portal/src/components/__tests__/

describe('GameLobby - 游戏大厅', () => {
  test('应正确渲染房间列表')
  test('应能创建新房间')
  test('应能加入已有房间')
  test('房间满员时应显示"已满"')
})

describe('GameRoom - 游戏房间', () => {
  test('应正确显示当前阶段信息')
  test('玩家应能发送聊天消息')
  test('玩家应能进行投票')
  test('应实时更新阶段变更')
  test('游戏结束后应显示复盘界面')
})

describe('ScriptEditor - 剧本编辑器', () => {
  test('应正确加载 YAML 内容到编辑器')
  test('应支持三栏布局切换')
  test('角色修改应实时反映在 YAML 预览')
  test('应验证 YAML 语法正确性')
})

describe('NovelCard - 小说卡片', () => {
  test('应正确显示小说封面、标题、类型')
  test('已存档的小说应显示存档标记')
  test('点击应跳转到详情页')
})

describe('AINovelGenerator - AI 小说生成器', () => {
  test('提示词输入不能为空')
  test('生成过程中应显示加载状态')
  test('生成完成后应展示小说内容')
  test('应处理生成失败的情况')
})
```

---

## 四、集成测试规划

### 4.1 API 端点集成测试

```typescript
// server/test/api.e2e-spec.ts

describe('API 端点集成测试 (e2e)', () => {
  // --- 认证 ---
  test('POST /api/auth/register - 成功注册')
  test('POST /api/auth/login - 成功登录，返回 token')
  test('POST /api/auth/login - 错误密码返回 401')
  
  // --- 小说 ---
  test('GET /api/novels - 返回小说列表', () => {
    // 验证 pagination 格式
    // 验证筛选/搜索/排序功能
  })
  test('POST /api/novels - 创建小说需认证')
  test('GET /api/novels/archived - 只返回已存档小说')
  
  // --- 剧本 ---
  test('POST /api/scripts/convert - 触发转换')
  test('GET /api/scripts/:id - 获取剧本详情')
  
  // --- 游戏 ---
  test('POST /api/game/rooms - 创建游戏房间')
  test('POST /api/game/rooms/:id/join - 加入房间')
  test('GET /api/game/rooms - 获取房间列表')
  
  // --- 社交 ---
  test('POST /api/collections - 添加收藏')
  test('POST /api/comments - 发表评论')
  test('POST /api/ratings - 评分')
})
```

### 4.2 WebSocket 集成测试

```typescript
describe('Socket.IO 网关集成测试', () => {
  test('客户端应能连接到游戏网关')
  test('客户端应能加入指定房间')
  test('玩家发言应广播给房间内其他玩家')
  test('阶段变更应通知所有房间内玩家')
  test('投票结果应汇总后广播')
  test('断线客户端应在重连后同步状态')
})
```

---

## 五、测试覆盖目标

| 模块 | 当前覆盖 | 目标覆盖 | 说明 |
|------|----------|----------|------|
| **游戏状态机** | 10% | ≥90% | 核心引擎，必须高覆盖 |
| **剧本转换引擎** | 5% | ≥85% | 核心算法，必须高覆盖 |
| **用户认证** | 0% | ≥80% | 安全关键 |
| **AI 模型模块** | 0% | ≥70% | 接口层覆盖 |
| **小说 CRUD** | 30% | ≥75% | 已有基础，补充完善 |
| **社交系统** | 0% | ≥70% | 接口层覆盖 |
| **前端组件** | 0% | ≥60% | 核心交互组件 |
| **API 端点** | 0% | ≥80% | e2e 覆盖 |

---

## 六、测试执行命令

```bash
# 运行前端所有测试
cd apps/user-portal
npx vitest run

# 运行前端测试（监视模式）
npx vitest

# 生成覆盖率报告
npx vitest run --coverage

# 运行特定测试文件
npx vitest run src/services/novelService.test.ts

# 运行后端 e2e 测试
cd server
npx jest --config test/jest-e2e.json

# 运行所有测试（根目录）
pnpm test
```

---

## 七、测试数据准备

### 7.1 Mock 数据

```typescript
// 测试用 Mock 小说
export const mockNovels = [
  {
    id: 1,
    title: '午夜庄园的秘密',
    description: '一座与世隔绝的庄园，一场精心策划的谋杀',
    genre: 'suspense',
    archived: true,
    rating: 4.5,
  },
  {
    id: 2,
    title: '镜中迷雾',
    description: '每一个镜子后面都藏着一段不为人知的秘密',
    genre: 'mystery',
    archived: false,
    rating: 3.8,
  },
];

// 测试用 Mock 游戏会话
export const mockGameSession = {
  id: 'session_001',
  phase: 'LOBBY',
  players: [
    { id: 'p1', name: '玩家A', character: '侦探' },
    { id: 'p2', name: '玩家B', character: '嫌疑人' },
    { id: 'p3', name: '玩家C', character: '目击者' },
    { id: 'p4', name: 'AI_1', character: '管家', isAI: true },
  ],
  script: { title: '午夜庄园的秘密' },
};
```

---

## 八、测试执行计划

### 阶段一：完善现有测试 (1天)

| 任务 | 说明 |
|------|------|
| 补充 novelService 测试 | 覆盖 create, getById 方法 |
| 扩展 gameUtils 测试 | 覆盖更多工具函数 |
| 添加 services 测试 | 为 scriptService, gameService 添加测试 |

### 阶段二：核心引擎测试 (2天)

| 任务 | 说明 |
|------|------|
| 游戏状态机单元测试 | 覆盖所有阶段转换和边界 |
| 剧本转换引擎测试 | 覆盖转换流程和 Schema 校验 |
| YAML 生成/校验测试 | 覆盖 YAML 处理全部逻辑 |

### 阶段三：接口与集成测试 (2天)

| 任务 | 说明 |
|------|------|
| API 端点 e2e 测试 | 覆盖所有 REST 接口 |
| WebSocket 集成测试 | 覆盖实时通信场景 |
| 认证流程测试 | 覆盖登录/注册/token 全流程 |

### 阶段四：前端组件测试 (2天)

| 任务 | 说明 |
|------|------|
| 核心组件渲染测试 | GameLobby, GameRoom, ScriptEditor |
| 交互行为测试 | 点击、输入、状态变更 |
| 状态管理测试 | Zustand store 逻辑 |

---

> 📅 最后更新：2025-01-20
> 📝 维护人：项目团队
