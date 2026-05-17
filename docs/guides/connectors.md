---
title: 连接器
description: 外部工具的 MCP 客户端、Claude Desktop 的 MCP 服务器以及远程访问。
---

# 连接器

Obsilo 可以使用 Model Context Protocol (MCP) 和 Cloudflare 中继连接到外部工具、将您的保险库暴露给其他 AI 应用程序，并提供远程访问功能。

## MCP 客户端：连接外部工具

MCP 客户端让 Obsilo 能够使用外部 MCP 服务器提供的工具。您无需编写插件即可扩展代理的能力。

### 可以连接的内容

任何兼容 MCP 的服务器均可使用。常见示例：
- 数据库工具（查询 SQLite、PostgreSQL 或其他数据库）
- Web 服务（与 API 交互、获取数据）
- 本地工具（文件系统工具、shell 命令、自定义脚本）
- 第三方集成（GitHub、Slack、日历服务）

### 设置

1. 打开 **设置 > Obsilo Agent > MCP**
2. 点击 **"+ 添加服务器"**
3. 选择传输类型：

| 传输方式 | 使用场景 |
|-----------|------------|
| stdio | 作为命令行进程运行的本地服务器 |
| SSE | 使用 Server-Sent Events 的远程服务器（传统） |
| Streamable HTTP | 现代远程服务器（推荐用于远程） |

4. 输入服务器命令或 URL
5. 保存。代理会自动发现可用工具。

连接后，代理可以使用 `use_mcp_tool` 调用外部工具，并使用 `manage_mcp_server` 管理服务器。

:::tip 自动发现
您无需告诉代理有哪些工具可用。它会从每个已连接的 MCP 服务器读取工具列表，并在与您的请求相关时使用它们。
:::

## MCP 服务器：将您的保险库暴露给 Claude Desktop

您可以将 Obsilo 转变为 MCP 服务器，让 Claude Desktop（或任何 MCP 客户端）读取和写入您的 Obsidian 保险库。

### 为什么这很重要

Claude Desktop 本身无法访问您的 Obsidian 笔记。启用 Obsilo 的 MCP 服务器后，它可以通过受控界面获得对您保险库的结构化访问：通过搜索、读取和写入笔记。

### 可用工具（3 个层级）

| 层级 | 工具 | 功能 |
|------|-------|-------------|
| 读取 | `read_notes`、`search_vault`、`get_context` | 搜索和读取保险库内容 |
| 会话 | `sync_session`、`update_memory` | 同步对话上下文和记忆 |
| 写入 | `write_vault` | 在您的保险库中创建和修改笔记 |

### 设置

1. 打开 **设置 > Obsilo Agent > MCP > 服务器** 选项卡
2. 启用 MCP 服务器
3. 点击 **"配置 Claude Desktop"**。这会自动将配置添加到 Claude Desktop 的配置文件中。
4. 重启 Claude Desktop

完成。Claude Desktop 现在将您的保险库视为可用的工具来源。

:::warning 写入权限
写入层级允许 Claude Desktop 修改您的保险库。仅在您信任通过 Claude Desktop 发送的提示时启用它。读取和会话层级适合日常使用。
:::

## 通过 Cloudflare 中继远程访问

远程访问让您无论身在何处都能与您的保险库交互，只要您的机器上正在运行 Obsidian。

### 工作原理

Cloudflare Workers 中继充当您本地 Obsilo 实例和远程客户端之间的桥梁。Obsilo 中的 RelayClient 维护与已部署 worker 的持久连接。

### 设置

1. 部署 Cloudflare Worker（请参阅中继部署指南）
2. 在 **设置 > Obsilo Agent > MCP > 远程** 中输入您的 worker URL
3. 使用提供的令牌进行身份验证
4. 当 Obsidian 运行时，中继会自动连接

:::info 持续运行要求
远程访问需要您的机器上正在运行 Obsidian。中继将请求转发到您的本地实例。它不会将您的保险库数据存储在云端。
:::

## 提供商概述

Obsilo 支持 10+ 个 AI 提供商。大多数使用简单的 API 密钥，但有两个使用替代身份验证：

| 提供商 | 身份验证方式 | 说明 |
|----------|------------|-------|
| GitHub Copilot | OAuth 设备流 | 使用您现有的 GitHub Copilot 订阅。无需单独的 API 密钥。您使用 GitHub 账户登录。 |
| Kilo Gateway | 设备认证 + 手动令牌 | 社区网关，共享速率限制。设备认证或手动粘贴令牌。 |
| Anthropic、OpenAI、Google 等 | API 密钥 | 在设置 > 模型中粘贴您的密钥。 |

### 设置 GitHub Copilot

1. 打开 **设置 > Obsilo Agent > 模型 > + 添加模型**
2. 选择 **GitHub Copilot** 作为提供商
3. 点击 **"使用 GitHub 登录"**。系统会显示设备代码。
4. 打开 GitHub URL，输入代码，然后授权
5. 选择模型（通过 Copilot 使用 Claude 或 GPT）

### 设置 Kilo Gateway

1. 选择 **Kilo Gateway** 作为提供商
2. 选择 **设备认证**（推荐）或 **手动令牌**
3. 对于设备认证：按照屏幕上的流程进行身份验证
4. 对于手动令牌：从 Kilo 仪表板粘贴您的令牌

:::tip 免费访问
如果您已有 Copilot 订阅，GitHub Copilot 即可使用。Kilo Gateway 提供社区访问，共享限制。这两个都是无需购买单独 API 密钥即可试用 Obsilo 的好选择。
:::

## 下一步

- [技能、规则和工作流](/guides/skills-rules-workflows)：自定义代理的行为
- [Office 文档](/guides/office-documents)：创建演示文稿和文档
- [多代理与任务](/guides/multi-agent)：将工作委托给子代理