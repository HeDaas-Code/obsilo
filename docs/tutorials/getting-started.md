---
title: 安装与快速开始
description: 在 3 分钟内安装 Obsilo 并开始第一次对话。
---

# 安装与快速开始

在 3 分钟内让 Obsilo 运行在你的 Obsidian 知识库中。

## 安装插件

1. 打开 **Obsidian 设置** > **社区插件**
2. 如果还没启用社区插件，点击「**已关闭**」切换为「**已开启**」
3. 在「社区插件」搜索框中输入 `Obsilo`
4. 找到 **Obsilo Agent**，点击「**安装**」
5. 安装完成后，点击「**启用**」

## 首次配置

1. 打开侧边栏：点击左侧边栏的 Obsilo 图标，或使用快捷键 `Ctrl/Cmd + P` 输入 `Obsilo`
2. 在设置中添加你的第一个 AI 模型（见下方）
3. 选择一个适合的模型作为默认模型

## 添加 AI 模型

Obsilo 支持多个 AI 提供商。如果没有特别偏好的话，推荐按以下步骤配置：

### Anthropic（推荐，质量最佳）

1. 访问 [console.anthropic.com](https://console.anthropic.com) 注册账号
2. 进入 **API Keys**，创建一个新密钥
3. 在 Obsilo 设置中，选择 **Anthropic** 作为提供商
4. 粘贴你的 API 密钥，选择一个模型（推荐 **Claude Sonnet 4**）
5. 点击「**测试连接**」确认配置正常

### OpenAI（支持语义搜索嵌入）

1. 访问 [platform.openai.com](https://platform.openai.com) 注册账号
2. 进入 **API Keys**，生成一个新密钥
3. 在 Obsilo 设置中，选择 **OpenAI** 作为提供商
4. 粘贴密钥并选择一个模型（推荐 **GPT-4o**）
5. 测试连接确认正常

### Ollama（本地运行，完全免费）

1. 从 [ollama.ai](https://ollama.ai) 下载安装 Ollama
2. 拉取一个模型：`ollama pull qwen2.5:7b`
3. 在 Obsilo 中选择 **Ollama** 作为提供商
4. 无需 API 密钥，模型列表会自动检测已运行的模型

## 开始对话

配置好模型后，在 Obsilo 侧边栏的输入框中输入你的第一个问题：

- 「查看我的知识库中有哪些笔记」
- 「帮我整理一下最近修改过的文件」
- 「找找关于 [某个主题] 的笔记」

## 下一步

- 了解 Obsilo 能做什么：[功能介绍](../guides/capabilities)
- 了解 Agent 模式与 Ask 模式的区别：[模式系统](../concepts/mode-system)
- 学习更多用法：[首次对话教程](./first-conversation)