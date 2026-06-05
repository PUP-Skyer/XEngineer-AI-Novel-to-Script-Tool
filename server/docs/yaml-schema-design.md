# 剧本杀 YAML Schema 设计文档

## 1. 概述

本文档定义了「AI 小说转剧本杀」平台中剧本文件的 YAML Schema。该 Schema 是整个系统的核心数据契约——AI 生成的剧本、数据库存储、前端编辑器、游戏引擎均围绕此格式运作。

**设计目标：**
- 让 AI 生成的剧本具有**结构化、可校验、可编辑**的特性
- 兼容剧本杀游戏的核心玩法（角色秘密、选择分支、多结局）
- 人类可读可编辑（YAML 格式优于 JSON）
- 支持 AI NPC 扮演（每个角色附带 ai_prompt）

---

## 2. Schema 完整定义

```yaml
# ============================================================
# 剧本杀 YAML Schema v1.0
# ============================================================

# --- 元数据 ---
metadata:
  title: "午夜庄园的秘密"        # 必填，剧本标题
  author: "AI"                   # 必填，默认 "AI"
  player_count:                  # 必填，游玩人数范围
    min: 4                       # 最少 2 人
    max: 8                       # 最多 12 人
  duration: "3小时"              # 预计时长
  difficulty: "medium"           # easy | medium | hard
  genre: "suspense"              # 剧本类型
  synopsis: "一座百年庄园中..."  # 故事梗概

# --- 角色 ---
characters:
  - id: "char_detective"         # 必填，唯一标识
    name: "林探长"               # 必填，角色名
    alias: "老林"                # 可选，别名/代号
    role: "protagonist"          # protagonist | antagonist | supporting | npc | dm
    description: "冷静机智的侦探" # 必填，角色简介
    personality: "冷静、观察力敏锐" # 可选，性格特点
    backstory: "曾是上海名侦探"   # 可选，背景故事
    secret: "他认识死者"          # 可选，角色秘密（不能主动透露）
    motivation: "查明真相"        # 可选，角色动机
    relationships: "与阿秀有旧情" # 可选，与其他角色的关系
    is_killer: false             # 是否为凶手（剧本杀核心线索）
    is_playable: true            # 是否可被玩家选择
    image_url: null              # 可选，头像 URL
    ai_prompt: "你是林探长..."   # 可选，AI 扮演此角色的 system prompt

  - id: "char_maid"
    name: "阿秀"
    role: "supporting"
    description: "沉默寡言的女仆"
    personality: "沉默、忠诚、偶尔不安"
    backstory: "在庄园工作了5年"
    secret: "她目睹了案发经过"
    motivation: "保护自己不被灭口"
    relationships: "对林探长有好感"
    is_killer: false
    is_playable: true

  - id: "char_dm"
    name: "旁白"
    role: "dm"                   # DM（主持人）角色
    description: "故事的叙述者"
    is_killer: false
    is_playable: false

# --- 场景 ---
scenes:
  - id: "scene_01"               # 必填，唯一标识
    number: 1                    # 可选，场景序号
    title: "暴风雨之夜"           # 必填，场景标题
    location: "庄园大厅"          # 必填，地点
    time: "深夜 23:00"           # 必填，时间
    description: "雷电交加的夜晚..." # 必填，场景描述
    atmosphere: "阴森、压抑"      # 可选，氛围描述

    # --- 对白 ---
    dialogues:
      - character_id: "char_dm"  # null 表示旁白叙述
        type: "narration_dm"     # dialogue | narration | narration_dm | stage_direction
        content: "暴风雨撕裂了夜空..."
        order: 1

      - character_id: "char_detective"
        type: "dialogue"
        content: "诸位，请把你们今晚的行踪都说一遍。"
        emotion: "严肃"
        action: "扫视在场所有人"
        order: 2

      - character_id: null       # 无人物 = 旁白
        type: "narration"
        content: "大厅里一片寂静，只有壁炉中的木柴噼啪作响。"
        order: 3

      - character_id: "char_maid"
        type: "dialogue"
        content: "*颤抖着* 我...我一直在厨房准备夜宵..."
        emotion: "恐惧"
        order: 4

    # --- 选择分支 ---
    choices:
      - id: "choice_01_a"
        text: "追问阿秀：'你真的什么都没看到？'"
        target_scene_id: "scene_02_interrogate"
        condition: null           # 可选，触发条件
        consequence: "阿秀开始崩溃"

      - id: "choice_01_b"
        text: "搜查大厅寻找线索"
        target_scene_id: "scene_02_investigate"
        condition: null
        consequence: "发现壁炉旁的血迹"
```

---

## 3. 设计原因与决策

### 3.1 为什么选择 YAML 而不是 JSON？

| 维度 | YAML | JSON |
|------|------|------|
| **人类可读性** | ✅ 缩进直观，注释友好 | ❌ 大量引号和括号干扰阅读 |
| **可编辑性** | ✅ 作者可直接修改对白 | ❌ 容易遗漏逗号导致解析失败 |
| **AI 生成友好** | ✅ YAML 格式更简洁，token 更少 | ❌ JSON 冗余符号多，浪费 token |
| **结构化能力** | ✅ 层级清晰，支持多行字符串 | ✅ 同样支持 |
| **工具链** | ✅ Monaco Editor、yaml npm 包 | ✅ 同样完善 |

**结论：** YAML 在「AI 生成 + 人类编辑」这个场景下是最佳选择。AI 输出更紧凑（节省 token 费用），人类编辑更直观。

### 3.2 为什么角色需要 `role` 字段？

剧本杀的角色类型决定了游戏行为：

- **protagonist（主角）**：剧情推动者，通常有最多秘密
- **antagonist（反派/凶手）**：被指控目标，需要隐藏身份
- **supporting（配角）**：提供线索的辅助角色
- **npc**：不可选角色，由 AI 自动扮演
- **dm（主持人）**：旁白叙述者，控制游戏节奏

`role` 字段让游戏引擎知道如何分配角色、控制发言顺序、决定哪些角色需要在「指控环节」被投票。

### 3.3 为什么需要 `secret` 和 `motivation`？

剧本杀的核心体验是**信息不对称**——每个角色只知道部分真相。

- `secret`：角色不能主动透露的信息，被追问时会表现紧张。AI 扮演时会在 system prompt 中注入此字段，约束 AI 不主动说出秘密。
- `motivation`：角色的行为驱动力，帮助 AI 生成符合角色动机的对白。

### 3.4 为什么选择分支（choices）放在场景级别？

**决策：** choices 作为 scene 的子字段，而非独立的路由表。

**原因：**
1. **局部性**：选择通常在特定场景末尾触发，放在一起更直观
2. **YAML 可读性**：编辑器打开一个场景就能看到所有分支
3. **AI 生成友好**：AI 按场景思考剧情，自然在场景末尾设计选择
4. **渲染简单**：前端只需读取当前场景的 choices 即可展示选项按钮

**如果放全局路由表的缺点：**
- 场景和选择分离，编辑时需要来回跳转
- YAML 结构不直观，不利于人工修改

### 3.5 为什么对白需要 `type` 字段？

剧本杀中「谁在说话」至关重要：

- `dialogue`：角色对话（玩家/AI 发言）
- `narration`：场景叙述（纯文字描述环境）
- `narration_dm`：DM 主持人旁白（推进剧情、营造氛围）
- `stage_direction`：舞台指示（动作、表情描述）

`type` 字段让游戏引擎知道：
- 是否需要等待玩家输入
- 是否触发 AI 响应
- 是否显示为特殊样式（旁白用灰色斜体）

### 3.6 为什么需要 `ai_prompt` 字段？

平台支持 AI NPC 扮演。当一个角色由 AI 控制时，系统需要：

1. 用 `ai_prompt` 作为 system prompt 初始化 LLM
2. 结合 `secret`、`motivation`、`personality` 约束 AI 行为
3. 在对话历史中注入角色上下文

**示例 AI Prompt 构造：**
```
你是「阿秀」，一个在庄园工作了5年的女仆。
性格: 沉默寡言、忠诚、偶尔流露出不安
秘密: 你目睹了案发当晚的部分经过，但害怕被灭口
动机: 保护自己不被灭口
规则:
1. 始终保持角色一致性
2. 不要主动说出秘密
3. 被追问时表现紧张
4. 回复控制在 200 字以内
```

### 3.7 为什么使用 Zod 做 Schema 校验？

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Zod** | TypeScript 类型推导、运行时校验、错误信息友好 | 需要额外依赖 |
| JSON Schema (Ajv) | 标准化、生态丰富 | TypeScript 类型不自动同步 |
| 手动校验 | 零依赖 | 容易遗漏、维护成本高 |

**选择 Zod 的关键原因：** Schema 定义一次，同时获得运行时校验 + TypeScript 类型。改了 Schema，类型自动更新，不会出现「校验通过但代码类型不匹配」的问题。

---

## 4. 转换流程

```
用户上传小说 (3+ 章节)
        ↓
AI 分析小说结构（人物、情节、冲突）
        ↓
AI 生成结构化 JSON（角色 + 场景 + 对白 + 选择）
        ↓
YamlGenerator 转为 YAML 格式
        ↓
YamlValidator (Zod) 校验格式
        ↓
保存到数据库 + 返回给前端
        ↓
前端 ScriptEditor 展示（三栏：角色面板 | 场景编辑 | YAML 预览）
```

---

## 5. AI 转换 Prompt 设计

转换 Prompt 指导 AI 将小说转为剧本：

```
你是一位专业的剧本杀编剧。你的任务是将小说内容转换为剧本杀剧本。

你需要:
1. 设计 4-8 个角色，每个角色有独特的性格、背景故事和秘密
2. 设计 5-10 个场景，每个场景有明确的地点和时间
3. 每个场景中包含角色之间的自然对白
4. 确保有至少一个"凶手"角色（is_killer: true）
5. 在关键场景末尾设计选择分支（choices）
6. 添加 DM 旁白（character_id: null）推进剧情
7. 输出格式为严格的 JSON，后续由系统转为 YAML
```

---

## 6. 校验规则

### 结构校验（Zod）
- `metadata.title` 必填
- `characters` 至少 2 个角色
- `scenes` 至少 1 个场景
- `dialogues` 中 `content` 不能为空

### 业务校验（代码）
- 必须至少有一个 `is_killer: true` 的角色
- 所有 `dialogues.character_id` 必须存在于角色列表中（null 除外）
- 所有 `choices.target_scene_id` 必须指向有效场景
- `player_count.min` ≤ `player_count.max`

---

## 7. 前后端 Schema 同步

| 层级 | 文件 | 作用 |
|------|------|------|
| **定义层** | `server/src/modules/script/schemas/script.schema.ts` | Zod Schema 定义 + TypeScript 类型导出 |
| **校验层** | `server/src/modules/script/converter/yaml-validator.ts` | 引用 Schema 做运行时校验 |
| **生成层** | `server/src/modules/script/converter/yaml-generator.ts` | 将 AI 输出转为符合 Schema 的 YAML |
| **前端类型** | `apps/user-portal/src/services/scriptService.ts` | 前端 TypeScript 接口（与 Schema 对齐） |

**同步策略：** 以 `script.schema.ts` 为 Single Source of Truth。修改 Schema 后，校验器自动适配，前端类型需手动同步。

---

## 8. 示例输出

```yaml
metadata:
  title: "午夜庄园的秘密"
  author: "AI"
  player_count:
    min: 4
    max: 6
  duration: "3小时"
  difficulty: "medium"
  genre: "suspense"
  synopsis: "暴风雨之夜，庄园主人离奇死亡。在场的每个人都有嫌疑..."

characters:
  - id: "char_detective"
    name: "林探长"
    role: "protagonist"
    description: "冷静机智的侦探"
    personality: "冷静、观察力敏锐"
    backstory: "曾是上海名侦探，因一桩冤案被迫离开城市"
    secret: "他认识死者，10年前有过一段交易"
    motivation: "查明真相，洗刷过去的耻辱"
    is_killer: false
    is_playable: true

  - id: "char_maid"
    name: "阿秀"
    role: "supporting"
    description: "沉默寡言的女仆"
    personality: "沉默、忠诚、偶尔不安"
    secret: "她目睹了案发经过，但害怕被灭口"
    is_killer: false
    is_playable: true

  - id: "char_heir"
    name: "张少爷"
    role: "antagonist"
    description: "庄园继承人，挥霍无度"
    personality: "傲慢、虚荣、内心脆弱"
    secret: "他欠下巨额赌债，急需继承遗产"
    motivation: "拿到遗产还债"
    is_killer: true
    is_playable: true

scenes:
  - id: "scene_01"
    number: 1
    title: "暴风雨之夜"
    location: "庄园大厅"
    time: "深夜 23:00"
    description: "雷电交加的夜晚，众人聚集在庄园大厅"
    atmosphere: "壁炉火光摇曳，窗外暴雨如注"
    dialogues:
      - character_id: null
        type: "narration_dm"
        content: "欢迎来到午夜庄园。暴风雨困住了所有人..."
        order: 1
      - character_id: "char_detective"
        type: "dialogue"
        content: "诸位，请把你们今晚的行踪都说一遍。"
        emotion: "严肃"
        order: 2
      - character_id: "char_heir"
        type: "dialogue"
        content: "*不耐烦地* 我一直在书房处理文件，这有什么好问的？"
        emotion: "不耐烦"
        action: "翘着二郎腿"
        order: 3
    choices:
      - id: "choice_01_a"
        text: "追问张少爷的不在场证明"
        target_scene_id: "scene_02_interrogate"
        consequence: "张少爷露出破绽"
      - id: "choice_01_b"
        text: "先搜查案发现场"
        target_scene_id: "scene_02_investigate"
        consequence: "发现关键物证"
```

---

## 9. 未来扩展方向

| 扩展 | 说明 | 优先级 |
|------|------|--------|
| 多结局支持 | `endings` 字段定义不同结局条件 | P1 |
| 线索系统 | `clues` 字段定义可收集的线索物品 | P1 |
| 时间线 | `timeline` 字段记录事件先后顺序 | P2 |
| BGM 标记 | `bgm` 字段在场景中标记背景音乐 | P3 |
| 自定义角色关系图 | `relationship_graph` 字段 | P3 |
