import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const tutorialsSidebar = [
  {
    text: '教程',
    items: [
      { text: '安装与快速开始', link: '/tutorials/getting-started' },
      { text: '第一次对话', link: '/tutorials/first-conversation' },
      { text: '第一个知识工作流', link: '/tutorials/knowledge-workflow' },
    ],
  },
]

const guidesSidebar = [
  {
    text: '概览',
    items: [
      { text: 'Obsilo 能做什么', link: '/guides/capabilities' },
    ],
  },
  {
    text: '配置',
    items: [
      { text: '如何选择模型', link: '/guides/choosing-a-model' },
    ],
  },
  {
    text: '日常使用',
    items: [
      { text: '聊天界面', link: '/guides/chat-interface' },
      { text: '库操作', link: '/guides/vault-operations' },
      { text: '知识发现', link: '/guides/knowledge-discovery' },
      { text: '记忆与个性化', link: '/guides/memory-personalization' },
      { text: '安全与控制', link: '/guides/safety-control' },
    ],
  },
  {
    text: '进阶',
    items: [
      { text: '技能、规则与工作流', link: '/guides/skills-rules-workflows' },
      { text: 'Office 文档', link: '/guides/office-documents' },
      { text: '连接器', link: '/guides/connectors' },
      { text: '多智能体与任务', link: '/guides/multi-agent' },
    ],
  },
  {
    text: '维护',
    items: [
      { text: '库健康检查', link: '/guides/vault-health' },
    ],
  },
]

const referenceSidebar = [
  {
    text: '参考',
    items: [
      { text: '工具', link: '/reference/tools' },
      { text: '提供商与模型', link: '/reference/providers' },
      { text: '设置', link: '/reference/settings' },
      { text: '故障排查', link: '/reference/troubleshooting' },
    ],
  },
]

const conceptsSidebar = [
  {
    text: '基础',
    items: [
      { text: 'Obsilo 如何工作', link: '/concepts/' },
      { text: 'Agent 循环', link: '/concepts/agent-loop' },
    ],
  },
  {
    text: '工具与决策',
    items: [
      { text: '工具系统', link: '/concepts/tool-system' },
      { text: '系统提示词', link: '/concepts/system-prompt' },
      { text: '模式系统', link: '/concepts/mode-system' },
    ],
  },
  {
    text: '安全',
    items: [
      { text: '治理', link: '/concepts/governance' },
    ],
  },
  {
    text: '智能层',
    items: [
      { text: '知识层', link: '/concepts/knowledge-layer' },
      { text: '记忆系统', link: '/concepts/memory-system' },
      { text: 'Token 优化', link: '/concepts/token-optimization' },
    ],
  },
  {
    text: '可扩展性',
    items: [
      { text: '插件发现', link: '/concepts/vault-dna' },
      { text: '自我开发', link: '/concepts/self-development' },
      { text: 'MCP 架构', link: '/concepts/mcp-architecture' },
    ],
  },
  {
    text: '专项系统',
    items: [
      { text: 'Office 流水线', link: '/concepts/office-pipeline' },
      { text: '提供商认证', link: '/concepts/provider-auth' },
      { text: 'UI 架构', link: '/concepts/ui-architecture' },
    ],
  },
]

export default withMermaid(
  defineConfig({
    title: 'Obsilo 中文增强版',
    description: '面向 Obsidian 的 Agentic AI 中文文档',
    head: [
      ['meta', { property: 'og:title', content: 'Obsilo 中文增强版' }],
      ['meta', { property: 'og:description', content: 'Obsilo 的中文文档站点，英文原始文档位于 /en。' }],
    ],

    appearance: 'dark',
    lastUpdated: true,
    cleanUrls: true,

    lang: 'zh-CN',

    themeConfig: {
      siteTitle: 'Obsilo 中文增强版',
      nav: [
        { text: '教程', link: '/tutorials/getting-started', activeMatch: '/tutorials/' },
        { text: '指南', link: '/guides/capabilities', activeMatch: '/guides/' },
        { text: '参考', link: '/reference/tools', activeMatch: '/reference/' },
        { text: '原理', link: '/concepts/', activeMatch: '/concepts/' },
        { text: '关于', link: '/about' },
        { text: 'English', link: '/en/' },
      ],
      sidebar: {
        '/tutorials/': tutorialsSidebar,
        '/guides/': guidesSidebar,
        '/reference/': referenceSidebar,
        '/concepts/': conceptsSidebar,
      },
        search: {
          provider: 'local',
        },
      editLink: {
        pattern: 'https://github.com/HeDaas-Code/obsilo/edit/main/docs/:path',
        text: '在 GitHub 上编辑此页',
      },
      footer: {
        message: '<a href="https://github.com/HeDaas-Code/obsilo/blob/main/LICENSE">Apache 2.0</a> | <a href="/imprint">法律声明</a>',
        copyright: '按“现状”提供，不附带任何担保或责任。',
      },
    },

    mermaid: {},
  }),
)
