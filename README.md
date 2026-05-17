# Obsilo Agent

**面向 Obsidian 的自主式 AI（中文增强版）。**

> [!IMPORTANT]
> 本仓库（`HeDaas-Code/obsilo`）是 `pssah4/obsilo` 的 fork 版本，命名为 **Obsilo 中文增强版**。默认以中文文档为主，英文原始文档保存在 `docs/en/` 目录下。

为 Obsidian 知识库提供自主式 AI 能力的运行层：内置 49+ 工具、语义检索、持久化记忆、多智能体流程、Office 文档生成与完整安全控制。支持 10+ 模型/服务提供方。Local-first，开源免费。

[官网文档](https://www.obsilo.ai) · [在线文档（中文）](https://www.obsilo.ai) · [English README](../docs/en/index.md)

---

## 功能一览

### 49+ 内置工具

按功能分为六组：

- **读取与搜索**：`read_file`、`read_document`、`list_files`、`search_files`
- **知识检索**：`semantic_search`、`get_frontmatter`、`search_by_tag`、`get_linked_notes`、`get_vault_stats`、`get_daily_note`、`query_base`、`open_note`
- **写入与编辑**：`write_file`、`edit_file`、`append_to_file`、`update_frontmatter`、`create_folder`、`delete_file`、`move_file`、`generate_canvas`、`create_excalidraw`、`create_base`、`update_base`
- **Office 文档**：`plan_presentation`、`create_pptx`、`create_docx`、`create_xlsx`
- **网络**：`web_fetch`、`web_search`（Brave / Tavily）
- **Agent 控制**：`new_task`、`update_todo_list`、`ask_followup_question`、`evaluate_expression`、`manage_skill`、`switch_mode` 等
- **插件集成**：`execute_command`、`call_plugin_api`、`enable_plugin`、`resolve_capability_gap`、`execute_recipe`、`render_presentation`
- **MCP**：`use_mcp_tool` —— 连接任意 MCP 服务器

### 语义搜索与知识图谱

基于 SQLite 向量索引（sql.js）实现语义搜索，结合 BM25 关键词搜索（RRF 融合）提升准确性。自动追踪 wikilinks 形成知识图谱，支持 1-3 跳图扩展。同时发现未连接的隐式关联笔记，并通过本地 cross-encoder 重排序优化结果。

### Agent 模式

内置两种模式 —— **问答**（只读，知识助手）和 **Agent**（完整能力）。支持自定义模式，可为不同模式配置不同的 AI 模型。

### 多智能体工作流

使用 `new_task` 启动子 Agent，处理复杂并行或顺序任务。内置编排者-工人、提示链、评估器-优化器、路由等多种模式。深度限制 2 层，读操作安全的工具并行执行。

### Office 文档

直接在知识库中创建 PowerPoint、Word、Excel 文件：
- **模板模式**：使用企业 PPTX 模板，Agent 分析所有版式和占位符，按原设计填充内容
- **即时模式**：无需模板，从零创建演示文稿
- **读取**：解析现有 PPTX、DOCX、XLSX、PDF、CSV、JSON 作为对话上下文
- **视觉 QA**：使用 LibreOffice 将演示文稿渲染为图片进行布局校验

### 沙箱代码执行

在安全的沙箱 iframe 中直接运行 TypeScript。可从 CDN 导入 npm 包（pptxgenjs、xlsx、pdf-lib、d3 等），无需 Node.js 或本地环境。

### 插件集成

Obsilo 在启动时自动扫描已安装的 Obsidian 插件，生成对应的技能文件。Agent 可调用 Dataview 查询、操作 Kanban 看板、运行 Templater 模板、使用 Excalidraw 绘图等。

### 三层记忆系统

- **会话记忆**：记录每段对话的摘要，包括决策、结论和待处理问题
- **长期记忆**：从会话中提炼出的持久化信息，包括用户偏好、项目背景、工作模式
- **灵魂**（Soul）：对用户沟通风格和 Agent 行为偏好的核心理解

聊天链接功能会在笔记 frontmatter 中记录对话 ID，方便追溯每处修改的来源。

### 上下文注入

- **规则**（`.obsidian-agent/rules/`）：永久指令，每次系统提示都注入
- **技能**（`.obsidian-agent/skills/`）：关键词触发，按需注入
- **工作流**（`.obsidian-agent/workflows/`）：斜杠命令驱动的指令集
- **自定义提示**：通过 `/prompt-slug` 模板使用 `{{userInput}}` 和 `{{activeFile}}` 变量

### 安全与控制

- **写入审批**：所有写操作默认需要审批（或按类别配置自动审批）
- **自动检查点**：每次任务首次写入前，通过 isomorphic-git 影子仓库创建快照，一键回滚
- **差异审查**：任务完成后显示分色差异，可按区块选择保留/撤销/编辑
- **知识库治理**：`.obsidian-agentignore` 和 `.obsidian-agentprotected` 访问控制文件
- **操作审计**：JSONL 操作日志，敏感信息脱敏，保留 30 天

### 服务提供方

| 提供方 | 类型 | 认证方式 | 说明 |
|--------|------|----------|------|
| Anthropic | 云端 | API Key | Claude 系列，工具调用测试表现最佳 |
| OpenAI | 云端 | API Key | GPT 系列，速度快，结构化输出优秀 |
| Google | 云端 | API Key | Gemini 系列，有免费额度 |
| OpenRouter | 网关 | API Key | 100+ 模型，统一入口，部分免费 |
| Azure OpenAI | 企业 | API Key + 端点 | 企业合规，支持私有端点 |
| GitHub Copilot | 网关 | OAuth | 使用现有 Copilot 订阅，无需独立 API Key |
| Kilo Gateway | 网关 | 设备认证 / Token | 社区网关，支持组织上下文 |
| MiniMax | 云端 | API Key | Anthropic 兼容端点，支持多语言翻译 |
| Ollama | 本地 | 无 | 完全免费、私密，支持众多开源模型 |
| LM Studio | 本地 | 无 | 免费的私密方案，带可视化模型浏览器 |
| Custom | 任意 | 视情况 | 任意 OpenAI 兼容端点 |

### MCP 集成

支持通过 stdio、SSE 或 streamable-HTTP 连接 MCP 服务器，工具动态发现并暴露给 Agent。Obsilo 也可作为 MCP 服务器，将知识库暴露给 Claude Desktop 或任意 MCP 客户端。

---

## 安装

> **提示：** Obsilo 正在申请 Obsidian 官方社区插件目录审核，审核通过前请通过 BRAT 或手动方式安装。

### BRAT（推荐）

1. 在社区插件中安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. 打开 BRAT 设置，选择 **Add Beta Plugin**
3. 输入 `https://github.com/HeDaas-Code/obsilo`
4. 在 设置 > 社区插件 中启用 "Obsilo Agent"

### 手动安装

```bash
git clone https://github.com/HeDaas-Code/obsilo.git
cd obsilo
npm install
npm run build
```

将 `main.js`、`styles.css` 和 `manifest.json` 复制到你的保险库：

```
<vault>/.obsidian/plugins/obsilo-agent/
```

在 Obsidian 中启用：设置 > 社区插件 > 启用 "Obsilo Agent"

### 环境要求

- Obsidian 1.4.0 及以上（1.8+ 支持 Bases 功能）
- 仅支持桌面端（移动端不可用）
- 构建需要 Node.js 18+

---

## 快速上手

1. **添加模型**：设置 > Obsilo Agent > Models > 点击 "+ 添加模型"
   - **免费方案**：获取 [Google AI Studio](https://aistudio.google.com/app/apikey) API Key（无需信用卡）
   - **最佳质量**：Anthropic Claude Sonnet 4.6 或 OpenAI GPT-4o
   - **本地私密**：安装 [Ollama](https://ollama.ai) 或 [LM Studio](https://lmstudio.ai)
2. **打开侧边栏**：点击工具栏中的 Obsilo 图标
3. **提问**：输入任何关于知识库的问题，例如 *"我关于项目 X 的笔记有哪些？"*
4. **执行任务**：切换到 Agent 模式，尝试 *"创建一周回顾模板"*

建议在 设置 > Embeddings 中配置嵌入模型并构建语义索引，以获得最佳搜索效果。

---

## 网络请求说明

本插件根据配置产生以下网络请求：

- **LLM API 调用**：每条消息都会发送到配置的模型提供方（Anthropic、OpenAI、Google、OpenRouter、Azure 或本地服务如 Ollama/LM Studio）。未配置提供方时不发送任何数据。
- **网络搜索**（可选）：使用 `web_search` 时，请求发送到配置的搜索 API（Brave 或 Tavily），默认关闭。
- **MCP 服务器**（可选）：连接的 MCP 服务器可能产生额外网络请求，取决于其自身配置。
- **无遥测**：插件不收集分析数据、使用数据或崩溃报告。
- **API Key 存储**：API Key 通过 Electron 的 safeStorage API 加密（在支持该 API 的系统上）。不支持 safeStorage 的系统上，Key 会回退到 Obsidian 的插件设置（`data.json`），此时 Key 不加密。若使用 Obsidian Sync，设置会被同步。

---

## 目录结构

```
<vault>/
├── .obsidian-agent/
│   ├── rules/            # 永久系统提示指令
│   ├── workflows/        # 斜杠命令工作流文件
│   └── skills/           # 关键词匹配技能说明
│
└── .obsidian/plugins/obsilo-agent/
    ├── checkpoints/      # 影子 git 仓库（自动撤销）
    ├── logs/             # JSONL 操作审计日志
    ├── memory/           # Agent 记忆文件（会话、长期、灵魂）
    └── semantic-index/   # 本地向量索引
```

---

## 文档

完整文档请访问：[www.obsilo.ai](https://www.obsilo.ai)

| 分类 | 路径 |
|------|------|
| 中文文档（默认） | `docs/` |
| 英文原始文档 | `docs/en/` |

### 新手入门

- [安装与快速上手](../docs/tutorials/getting-started.md)
- [你的第一次对话](../docs/tutorials/first-conversation.md)
- [选择模型](../docs/guides/choosing-a-model.md)

### 使用 Obsilo

- [聊天界面](../docs/guides/chat-interface.md)
- [知识库操作](../docs/guides/vault-operations.md)
- [知识发现](../docs/guides/knowledge-discovery.md)
- [记忆与个性化](../docs/guides/memory-personalization.md)
- [安全与控制](../docs/guides/safety-control.md)

### 进阶使用

- [技能、规则与工作流](../docs/guides/skills-rules-workflows.md)
- [Office 文档](../docs/guides/office-documents.md)
- [连接器（MCP）](../docs/guides/connectors.md)
- [多 Agent 与任务](../docs/guides/multi-agent.md)

### 参考

- [工具列表](../docs/reference/tools.md)
- [服务提供方与模型](../docs/reference/providers.md)
- [设置说明](../docs/reference/settings.md)
- [故障排除](../docs/reference/troubleshooting.md)

---

## 开发

```bash
npm install       # 安装依赖
npm run dev       # 开发构建（监听模式）
npm run build     # 生产构建
```

---

## 许可

Apache 2.0

---

## 致谢

- [Kilo Code](https://kilocode.ai) —— 架构灵感来源
- [Obsidian](https://obsidian.md) —— 平台提供方
- [sql.js](https://github.com/sql-js/sql.js) —— WebAssembly 版 SQLite（知识层向量存储）
- [Hugging Face Transformers.js](https://github.com/huggingface/transformers.js) —— 本地 ONNX cross-encoder 重排序
- [isomorphic-git](https://isomorphic-git.org) —— 纯 JS 实现的 Git（检查点功能）
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) —— Model Context Protocol