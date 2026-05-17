---
title: MCP
description: Obsilo 如何同时作为 MCP 客户端和 MCP 服务器运行，连接外部工具并暴露保险库访问能力
---

# MCP

Model Context Protocol（MCP）是一种将 AI 智能体连接到外部工具和数据源的标准化协议。Obsilo 同时扮演客户端和服务器两个角色：它连接到你配置的外部 MCP 服务器，同时也将你的保险库暴露给 Claude Desktop 等外部智能体。

## 双向通信

```mermaid
flowchart LR
    E[外部 MCP 服务器] -->|工具与资源| O[Obsilo]
    O -->|保险库工具| C[Claude Desktop / 其他智能体]
```

左侧：Obsilo 主动连接你配置的 MCP 服务器。比如一个可以搜索问题的 GitHub 服务器，或者一个可以执行查询的数据库服务器。这些服务器暴露的任何工具都会与内置工具一起出现在智能体的工具列表中。

右侧：Obsilo 本身就是服务器。Claude Desktop 连接到它并获取对你保险库的访问权限：搜索笔记、读取文件、写入内容。你的 Obsidian 保险库成为任何 MCP 兼容智能体都可以使用的工具。

## 客户端侧

你在「设置」的「Providers > MCP Servers」下配置 MCP 服务器。每个服务器需要指定传输类型（stdio 用于本地进程，SSE 用于旧版远程服务器，Streamable HTTP 用于现代远程服务器）以及连接详情。

当 Obsilo 连接到服务器时，它通过 MCP 标准发现协议发现可用的工具和资源。这些工具会与内置工具一起出现在智能体的工具列表中。智能体像调用其他工具一样调用它们，无需知道它们运行在独立的进程中。

MCP 客户端自动处理重连。如果服务器崩溃或无法访问，客户端会使用指数退避进行重试。SSE 传输仍然作为尚未迁移到 Streamable HTTP 的旧版 MCP 服务器的备选方案被支持。

资源（与工具并列的第二个 MCP 概念）也被支持。如果 MCP 服务器暴露了文档文件或数据库 schema 等资源，Obsilo 可以列出并读取它们。智能体在需要时将资源内容作为额外上下文拉取进来。

## 服务器侧

`McpBridge`（`src/mcp/McpBridge.ts`）在本地主机上运行一个 HTTP 服务器（默认端口 27182），使用 MCP Streamable HTTP 协议。它暴露六个工具，分为三个层级：

| 层级 | 工具 | 功能 |
|------|-------|-------|
| 读取 | `get_context`、`search_vault`、`read_notes` | 获取信息，不修改任何内容 |
| 会话 | `sync_session`、`update_memory` | 管理对话历史和持久化记忆 |
| 写入 | `write_vault`、`execute_vault_op` | 创建、编辑、删除文件；执行保险库操作 |

`get_context` 工具是必需的。外部智能体应在每次对话开始时首先调用它。它返回用户画像、记忆、行为模式、保险库统计信息、可用的技能和规则，与 Obsilo 内部智能体从系统提示词获得的上下文相同。

所有工具调用直接分派到 Obsilo 在 Obsidian 渲染进程内的服务。无 IPC 开销。HTTP 处理器调用与内部智能体使用的相同函数。

MCP 服务器上的 `search_vault` 工具使用[知识层](./knowledge-layer.md)页面描述的相同知识层管道。外部智能体获得与内部智能体相同的四阶段检索（向量搜索、图扩展、隐式连接、重排序）。`write_vault` 工具支持批量操作：单次调用可执行创建、编辑、追加和删除。

## 远程访问

本地 HTTP 服务器只能在你的机器上访问。对于远程访问（从不同设备上的 Claude Desktop 或 Claude 网页应用），`RelayClient`（`src/mcp/RelayClient.ts`）连接到 Cloudflare Workers  relay。

Relay 使用 HTTP 长轮询。客户端轮询传入请求，在本地处理，然后将响应发送回去。认证使用嵌入在 URL 中的令牌。Relay 上不存储任何数据，它只是一个透传通道。

远程访问需要 Obsidian 在你的机器上运行。Relay 无法自行访问你的保险库，它只是将请求转发给插件。

`RelayClient` 处理连接生命周期：初始连接、当 relay 不可达时使用指数退避进行重连，以及插件卸载时的干净关闭。回调通知设置界面当前的隧道 URL，以便你可以将其复制到 Claude Desktop 的 MCP 配置中。

## 系统上下文

通过 MCP 连接的外部智能体不会自动了解如何运作。`buildPrompts` 函数（`src/mcp/prompts/systemContext.ts`）生成关于你保险库的上下文：大小、结构、已安装的插件、启用的规则。外部智能体将这些作为 `get_context` 响应的一部分接收，使它们获得足够的背景知识而无需手动设置。

## 实际使用

你可以将 Claude Desktop 作为主要界面，而由 Obsilo 处理保险库集成。或者你可以通过连接专门的 MCP 服务器来扩展 Obsilo（代码分析、网页抓取、日历集成）。两个方向的协议是相同的。

MCP 服务器只在 Obsidian 打开时运行。如果你关闭 Obsidian，Claude Desktop 将失去对保险库工具的访问权限，直到你重新打开它。

## 会话同步

当你通过 Claude Desktop 使用 Obsilo 时，对话历史保存在 Claude Desktop 中，而不是在 Obsidian 中。在对话结束时调用 `sync_session` 会将消息复制到 Obsidian 的对话存储中。然后你可以在 Obsidian 的历史面板中浏览对话，记忆系统也可以从中提取模式。

会话同步在工具描述中被标记为必需的。Claude Desktop 被指示在每次对话结束时调用它。在实践中，它是尽力而为的。如果 Claude Desktop 在未调用它的情况下终止对话，该会话只是不会出现在 Obsidian 的历史记录中。