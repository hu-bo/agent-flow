# @agent-flow/chat-ui

可扩展的 React 聊天面板组件库，供 Playground 等前端应用使用。

## 技术栈

- React 18+ / TypeScript
- Vite 构建
- ES Module 输出

## 主要导出

| 组件 | 说明 |
|------|------|
| `ChatPanel` | 聊天面板主组件 |
| `MessageList` | 消息列表 |
| `MessageBubble` | 单条消息气泡 |
| `InputArea` | 输入区域 |

### 内容渲染器

支持多种消息内容类型的渲染：

- Text — Markdown 渲染（`react-markdown` + `remark-gfm`）
- Thinking — 思维链展示
- Image — 图片展示
- CodeDiff — 代码差异对比（`diff` + `highlight.js`）
- ToolCall / ToolResult — 工具调用与结果
- FileAttachment — 文件附件

## 使用

```bash
pnpm add @agent-flow/chat-ui
```

```tsx
import { ChatPanel } from '@agent-flow/chat-ui';

<ChatPanel messages={messages} onSend={handleSend} />
```

## Peer Dependencies

- `react >= 18`
- `react-dom >= 18`

## 构建

```bash
pnpm --filter @agent-flow/chat-ui build
```
