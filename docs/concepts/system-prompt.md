---
title: System Prompt
description: How the agent's system prompt is assembled from modular sections, skills, memory, and mode context.
---

# System Prompt

System prompt 是模型看到的第一个内容。它告诉 agent 是谁、有什么工具、要遵循什么规则，以及用户的保险库（vault）是什么样的。这个 prompt 不是静态字符串，而是由 16 个独立的模块化 section 组合而成，并按当前模式进行过滤，还包含运行时上下文（如 skills 和 memory）。

编排器是 `src/core/systemPrompt.ts` 中的 `buildSystemPromptForMode()` 函数。各 section 位于 `src/core/prompts/sections/` 目录。

## 为什么要模块化？

当 prompt 达到几百行时，单体式（monolithic）prompt 会变得难以管理。Obsilo 的 prompt 经常超过 5,000 个 token，因为 agent 需要理解 49 个工具、安全规则、保险库约定和用户特定上下文。模块化解决两个实际问题：

- 不同模式需要不同的 prompt。只读模式不应该包含写工具的描述。子任务应该跳过 skills 和 memory 以保持轻量。使用模块，你可以开关各 section。
- 添加一个 skill 或新的工具组不应该需要编辑单体模板。每个关注点都存在于自己的文件中。

## 组合顺序

位置很重要。LLM 对顶部（首因效应）和底部（近因效应）的内容关注度更高。但事实证明，第二个约束比首因效应更重要：KV-cache 效率。

现代 LLM API 会缓存 prompt 前缀的 key-value 状态。只要 prompt 开头在各调用之间保持相同，缓存的 token 就不需要重新计算。Anthropic 的 API 通过 cache control 参数显式提供此功能。OpenAI 和 DeepSeek 做自动前缀缓存。开头的一个 token 变化就会使之后所有内容的整个缓存失效。

原始 prompt 在第 1 位放置了当前时间戳。每个 API 调用的时间戳都不同，所以跨迭代的缓存命中数为零。把时间戳移到末尾，并将所有 section 按稳定性排序，使整个任务会话中前约 20,000 个 token 可以缓存。在八次迭代中，实际计算从 8 x 25,000 = 200,000 个 token 减少到大约 25,000 + 7 x 5,000 = 60,000 个 token。

各 section 现在按稳定性排序，稳定的 prefix 在前，动态内容在后：

**稳定的 prefix（在一个会话内的各迭代之间缓存）：**

| # | Section | 功能 |
|---|---------|-------------|
| 1 | Mode Definition | 设置角色，塑造后续所有内容 |
| 2 | Capabilities | agent 能做什么的简要总结 |
| 3 | Obsidian Conventions | 保险库特定规则：frontmatter、wikilinks 等 |
| 4 | Tools | 工具列表，按模式的 `toolGroups` 过滤（约 8,000 token）|
| 5 | Tool Routing | 工具选择规则和决策指南 |
| 6 | Objective | 任务分解策略 |
| 7 | Response Format | 输出结构规则（在子任务中跳过）|
| 8 | Security Boundary | Prompt 注入防御、权限边界 |

**动态后缀（每个消息或会话都可能变化，不缓存）：**

| # | Section | 功能 |
|---|---------|-------------|
| 9 | Plugin Skills | 已安装 Obsidian 插件中的 skills |
| 10 | Active Skills | 高优先级工作流指令（在子任务中跳过）|
| 11 | Memory | 用户 memory 上下文（在子任务中跳过）|
| 12 | Procedural Recipes | 针对已知任务模式的学习和静态 recipes |
| 13 | Self-Authored Skills | agent 通过 `manage_skill` 创建的 skills |
| 14 | Custom Instructions + Rules | 用户的全局 + per-mode 指令，`.obsilo/rules/` 中的规则 |
| 15 | Vault Context | 当前保险库状态和结构 |
| 16 | Date/Time | 当前时间戳（必须在最后，每次调用都会变化）|

空的 section 在连接前会被过滤掉。如果没有 memory 上下文，memory section 就不会出现。没有空洞的标题，没有浪费的 token。

将 skills 从第 3 位移到第 10 位会损失一些首因效应。作为补偿，系统在每次 LLM 调用前将当前任务列表作为最后的用户消息附加，利用模型的近因偏差。这种技术借鉴自 Manus 的上下文工程方法。

## Skills 如何注入

Skills 是包含工作流指令的 markdown 文件。当用户消息匹配其触发关键词时激活。流程如下：

1. `SkillLoader` 从 `.obsilo/skills/` 和捆绑的 skill 目录读取 skills。
2. 用户消息与每个 skill 的触发模式进行匹配。
3. 匹配的 skills 被连接成位于第 10 位的 active skills section。

Skills 位于动态块中，因为不同消息会激活不同的 skills。将它们放在稳定 prefix 中会在 active skill 集合变化时使 KV cache 失效。为了弥补降低的首因效应，skills 带有 `SKILL PRECEDENCE (MANDATORY)` 标题，模型将其视为强指令信号。近因锚点（任务列表作为最后的用户消息）提供额外强化。

Self-authored skills（agent 通过 `manage_skill` 创建的）位于第 13 位，在 active skills 和 memory 之后。它们补充主要 skills，而不是替换它们。

## Memory 如何注入

Memory section 从用户的 memory 数据库中提取相关条目并作为上下文注入。子任务完全跳过 memory 以保持子 prompt 聚焦。

## Token 预算

System prompt 不能超过模型的上下文窗口。当你添加长的自定义指令或加载多个 skills 时，prompt 会增长。核心 section（tools、security boundary）始终存在。可选 section（memory、skills、custom instructions）可以根据可用上下文进行修剪或跳过。

子任务在修剪上最为激进。子任务跳过 skills、memory、response format、recipes、self-authored skills 和 custom instructions。它只获得工具、规则和任务。没有更多。

## Per-mode 自定义

每个模式提供一个放入 mode definition section 的 `roleDefinition`，以及可选的附加到 custom instructions section 的 `customInstructions`。`toolGroups` 字段控制哪些工具出现在 tools section 中。

两个模式可以从同一组 section 模块产生非常不同的 system prompt。Ask 模式获得只读角色定义且没有写工具。Agent 模式获得完整集合。

## Prompt 缓存

System prompt 有两级缓存。在应用层面，`AgentTask` 缓存每个模式的组合 prompt，只有在当前模式变化、影响工具可用性的设置变化或触发显式失效时才会重建。

在 API 层面，稳定的 prefix（第 1-8 位）受益于提供商级别的 KV-cache。Anthropic 的 API 在 system prompt 上接收 `cache_control` 标记。OpenAI 和 DeepSeek 做自动前缀缓存。因为所有动态内容都在稳定块之后，第一个约 20,000 个 token 在每个会话中计算一次，后续迭代从缓存中提供。这是系统中最主要的成本优化：它将 system prompt 从第二大成本块转变为每次迭代接近零的边际成本。

## 动力转向

在长时间运行的任务中，`AgentTask` 每 N 次迭代注入一条合成用户消息。它包含当前模式的角色定义、active skill 名称，以及保持任务焦点的提醒。这不是 system prompt 的改变；而是作为用户角色消息附加到对话历史中。模型将其视为重定向。