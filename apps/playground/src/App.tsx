import { useState } from 'react';
import { useChat } from './hooks/useChat';
import { ChatPanel } from '@agent-flow/chat-ui';
import type { ChatMessage } from '@agent-flow/chat-ui';
import { Sidebar } from './components/Sidebar';

export function App() {
  const { messages, sendMessage, isConnecting, isStreaming } = useChat();
  const [activeSession, setActiveSession] = useState<string | null>(null);

  return (
    <div className="app-layout">
      <Sidebar activeSessionId={activeSession} onSelectSession={setActiveSession} />
      <ChatPanel
        messages={messages as ChatMessage[]}
        onSend={sendMessage}
        isStreaming={isStreaming}
        isConnecting={isConnecting}
      />
    </div>
  );
}
