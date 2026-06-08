# 🏗️ AI剧本杀游戏 - 系统架构文档

> 本文档通过可视化图表描述项目的整体架构、模块关系、数据流和部署拓扑。

---

## 一、系统整体架构图

![系统整体架构图](assets/system-architecture.png)

*5层架构：用户层 → 网关层 → 业务服务层 → 基础设施层 → AI 模型层*

---

## 二、游戏状态机流程图

![游戏状态机](assets/game-state-machine.png)

*8阶段：LOBBY → INTRO → READING → DISCUSSION → ACCUSATION → VOTING → REVEAL → ENDED → REVIEW*

---

## 三、剧本转换引擎流程图

![剧本转换引擎](assets/script-conversion-flow.png)

*4阶段转换：分析结构 → 提取角色 → 生成框架 → 润色校验*

---

## 四、数据模型 ER 图

![数据模型 ER 图](assets/data-model-er.png)

*核心实体关系：User, Novel, Script, Character, GameSession, Comment, Achievement, Notification*

---

> 📅 最后更新：2025-06-08  
> 📝 维护人：项目团队  
> 🛠 图表工具：SVG
