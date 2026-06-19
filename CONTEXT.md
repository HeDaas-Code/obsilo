---
title: obsilo 领域术语表
type: context
status: active
last_updated: 2026-06-19
---

# CONTEXT.md — obsilo 领域术语表

## 项目核心概念

### Obsilo Agent

面向 Obsidian 知识库的自主式 AI 插件（中文增强版）。fork 自 `pssah4/obsilo`。

### 工具（Tool）

`src/core/tools/BaseTool.ts` 的子类。每个工具有：
- `name: ToolName`（联合类型字面量）
- `isWriteOperation: boolean`（决定是否需要确认）
- `getDefinition()`：导出为 LLM function calling schema
- `execute(input, ctx)`：实际执行入口

**49+ 内置工具**（按功能分 6 组）：读取/搜索、知识检索、写入/编辑、Office 文档生成、网络、Agent 控制。

### Agent 模式

内置两种模式：
- **问答（qa）**：只读，知识助手
- **Agent（agent）**：完整能力，可写可执行

可自定义模式，每种模式独立配置 LLM 模型。

### ToolExecutionContext

工具执行的运行时上下文——包含 `taskId`/`mode`/`callbacks` + 可选 `askQuestion`/`switchMode`/`spawnSubtask`/`updateTodos` 等。

### ApiHandler

LLM 适配层接口 `createMessage(systemPrompt, messages, tools): AsyncGenerator<ApiEvent>`——支持 10+ 模型/服务提供方（OpenAI / Anthropic / Ollama / 阿里百炼等）。

### 语义检索

SQLite 向量索引（sql.js） + BM25 关键词检索 → RRF 融合 → cross-encoder 重排序。

### 知识图谱

自动追踪 wikilinks，1-3 跳图扩展，发现未连接的隐式关联笔记。

### 多智能体工作流

`new_task` 启动子 Agent（深度限制 2 层）。模式：编排者-工人、提示链、评估器-优化器、路由。

### Daytona 沙盒

NOT USED in obsilo（cerebellum 用）。obsilo 不依赖远程沙盒。

## 项目特定命名

| 术语 | 含义 |
|---|---|
| **vault** | Obsidian 知识库根目录 |
| **wikilink** | `[[笔记名]]` 双向链接 |
| **frontmatter** | 笔记顶部 YAML 元数据 |
| **MCP** | Model Context Protocol（obsilo 通过 `use_mcp_tool` 连接外部 MCP server） |
| **ToolName** | 所有工具名联合类型字面量（`"read_file"` \| `"search_files"` \| ...） |
| **RRF** | Reciprocal Rank Fusion（语义 + 关键词结果融合算法） |

## 不混淆概念

- **obsilo ≠ cerebullum**——前者是 Obsidian 插件（TypeScript），后者是 Python 库
- **obsilo 用 sql.js 不在远程**——本地 SQLite，不需要 server
- **BaseTool 不等于 API 工具**——前者是 obsilo 内部抽象，后者是 LLM function calling

## 待补

- [ ] 49 个工具的全名清单
- [ ] 10 个 LLM provider 列表
- [ ] 插件 lifecycle（onload/onunload）的关键钩子
- [ ] release notes 历次变更要点（v2.2.7 → v2.2.8 等）