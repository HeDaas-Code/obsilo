---
title: 插件发现
description: Obsilo 如何自动发现已安装的 Obsidian 插件并将其提供给 agent 使用。
---

# 插件发现

Obsidian 的插件生态系统是其优势之一。Obsilo 可以与您已安装的插件协同工作，但首先需要知道有哪些插件可用。VaultDNA 可以自动完成这一过程。

## 扫描工作原理

```mermaid
flowchart LR
    S[扫描已安装插件] --> C[按功能分类]
    C --> G[生成 skill 文件]
    G --> A[在 agent 提示词中可用]
```

`VaultDNAScanner`（`src/core/skills/VaultDNAScanner.ts`）在启动时读取 `app.plugins.manifests`，其中列出了所有已安装的插件（无论是否启用）。对于每个插件，它会提取：

- 插件的名称、版本和描述
- 所有已注册的命令
- 插件当前是否已启用

命令是关键部分。它们是 Obsidian 插件暴露功能的主要方式，agent 通过 `execute_command` 工具与它们进行交互。

扫描器会区分核心插件（随 Obsidian 附带）和社区插件（从社区注册表安装或手动安装）。核心插件具有稳定且文档完善的命令 ID。社区插件在质量和命名规范方面差异很大。

## 分类

并非每个命令都对 agent 有用。扫描器会过滤掉在无头环境下没有意义的纯 UI 命令：侧边栏切换、"显示设置"对话框、"聚焦面板"操作等。过滤使用模式匹配，针对类似 `toggle`、`show-`、`focus` 的前缀和 `-panel`、`-sidebar`、`-settings` 的后缀。

过滤后，每个插件按其拥有的可代理命令数量进行分类。像 Dataview 这样具有许多可查询命令的插件会获得较高的分类。仅注册"切换侧边栏"命令的插件被归类为纯 UI 插件。没有可用命令的插件仍会记录在 vault DNA 中，但不会生成 skill 文件。

## Skill 文件生成

对于每个具有可用命令的插件，扫描器会在 `.obsidian-agent/plugin-skills/` 目录下生成一个 `.skill.md` 文件。这些 skill 文件是 Markdown 文档，以 agent 能理解的格式描述插件的功能。它们列出可用命令、描述每个命令的用途，并提供使用提示。

生成的 skills 属于骨架质量：来自插件清单和命令的结构信息，但没有 LLM 生成的内容描述或使用示例。这是刻意为之的。生成过程完全离线运行，不进行网络调用，也没有 LLM 参与。准确性仅限于清单提供的范围。

核心 Obsidian 插件（每日笔记、模板、画布等）会得到更好的处理。扫描器包含一个 `CorePluginLibrary`，其中包含内置插件的手写定义，因此这些插件的 skill 文件比仅解析清单产生的更加详细。

## Vault DNA 持久化

扫描结果作为 `vault-dna.json` 持久化到 `.obsidian-agent/` 目录中。这样可以避免每次启动时重新扫描。扫描器定期轮询变化，将当前已启用的插件与其上次已知状态进行比较。当您启用或禁用插件时，它会检测到变化并更新 DNA 文件和生成的 skill 文件。

轮询间隔足够短，变化会在几秒内被捕获。如果您安装了一个新的社区插件并启用它，下一次对话时就已经知道它的存在了。

## 能力差距解决

有时 agent 会遇到无法用内置工具处理的任务。`CapabilityGapResolver`（`src/core/skills/CapabilityGapResolver.ts`）会在 vault DNA 中搜索可能有帮助的插件。

当 agent 调用 `resolve_capability_gap` 工具并描述类似"我需要创建一个看板"这样的需求时，解决器会提取关键词，在 DNA 中扫描匹配的插件，并返回匹配结果（附带相关命令）或安装社区插件的建议。

这是尽力而为的服务。对于名称和命令描述能清楚表明其用途的插件效果很好。如果插件的元数据模糊不清，或者所需能力需要尚未安装的插件，则无法找到匹配。

## 运行时 skill 元数据

除了持久化的 skill 文件外，扫描器还在内存中维护一个 `PluginSkillMeta` 对象列表。这些对象包含插件 ID、分类和命令列表，以结构化格式注入系统提示词。agent 在对话开始时就知道有哪些插件可用以及它们能做什么，无需读取每个 skill 文件。

## 什么有效，什么无效

插件发现在那些通过描述性名称的命令暴露功能的插件上效果最好。例如，Obsidian Tasks 插件注册了类似 `tasks:toggle-done` 和 `tasks:create-or-edit` 这样的命令，能清楚地传达它们的用途。

对于通过 UI 交互而非命令操作的插件效果较差。添加了自定义视图类型但没有注册任何命令的插件对 agent 是不可见的。扫描器会记录它的存在，但 agent 无法对其执行任何操作。

需要配置（API 密钥、文件路径、特定设置）才能工作的插件是另一个挑战。扫描器可以检测插件及其命令，但无法知道插件是否已正确配置。agent 可能会尝试使用某个命令，却因插件尚未设置而收到错误。

## 与 skill 系统的关系

插件 skills 是更广泛 skill 系统中的一个类别。Obsilo 有三个技能来源：

1. 插件 skills（由 VaultDNAScanner 生成，存储在 `.obsidian-agent/plugin-skills/`）
2. 用户 skills（由您或 agent 编写，存储在 `.obsidian-agent/skills/`）
3. 内置 skills（随插件打包）

这三种类型都是具有相同结构的 Markdown 文件。agent 在运行时不会区分它们。根据与当前对话的相关性，它们都被加载到系统提示词中。这种区分对管理很重要：插件 skills 在插件变化时自动重新生成，用户 skills 持续保留直到您删除它们，内置 skills 随插件更新而更新。