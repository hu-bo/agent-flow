import { useState } from 'react';
import { Send, Bot, User, Sparkles, Paperclip, MoreHorizontal, Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Welcome back to Aether. I'm ready to assist with your programming and content workflows. How can I help today?",
  },
];

export function ChatView() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    
    // Mock response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I've analyzed your prompt. Let's run this through the `Content_Optimizer_Agent` workflow for better results. Initiating...",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-canvas text-text-primary">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-border bg-panel/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="font-mono text-[10px] tracking-widest text-text-muted uppercase">Terminal_Session : Aether-Assistant</h2>
        </div>
        <button className="text-text-muted hover:text-text-primary transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-4 font-mono text-[11px] leading-relaxed">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={msg.id} 
            className="flex flex-col gap-1 w-full max-w-4xl mx-auto"
          >
            {msg.role === 'user' ? (
              <div className="flex gap-2">
                <span className="text-brand-400">User:</span>
                <span className="text-text-primary">{msg.content}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1 p-3 bg-panel/40 border border-border/50 rounded mt-1">
                <div className="text-emerald-400 font-bold uppercase text-[9px] mb-1">Agent: Aether Core</div>
                <div className="text-text-primary">{msg.content}</div>
                
                {i === messages.length - 1 && (
                  <div className="mt-2 text-text-muted italic">
                    [12:05:04] Task serialized. Saving to Articles_Metadata.
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
        {/* Blinking cursor for latest assistant message */}
        <div className="flex gap-2 animate-pulse w-full max-w-4xl mx-auto pl-1 hidden">
          <span className="text-brand-400">Agent:</span>
          <span className="w-2 h-4 bg-brand-500"></span>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="max-w-4xl mx-auto relative group">
          <div className="relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Enter command or prompt..."
              className="w-full bg-[#020617] border border-border-subtle rounded-lg py-2 pl-4 pr-10 text-xs font-mono focus:outline-none focus:border-brand-500 text-text-primary"
            />
            <div className="absolute right-3 top-2.5 text-text-muted font-mono text-[10px]">⏎</div>
          </div>
          <div className="flex gap-4 mt-3 pl-2">
            <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 cursor-pointer">
              <div className="w-3 h-3 bg-panel rounded border border-border"></div>
              <span className="text-[9px] font-mono text-text-muted hover:text-text-primary">ATTACH</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 cursor-pointer">
              <div className="w-3 h-3 bg-panel rounded border border-border"></div>
              <span className="text-[9px] font-mono text-text-muted hover:text-text-primary">VOICE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
