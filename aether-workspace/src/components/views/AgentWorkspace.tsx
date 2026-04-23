import { useState } from 'react';
import { Play, RotateCcw, Box, TerminalSquare, Sparkles, SplitSquareHorizontal, Type, Settings2, Save } from 'lucide-react';
import { motion } from 'motion/react';

const MOCK_CODE = `import { Agent } from '@aether/core';
import { LlmRouter } from '@aether/routers';

// Hardcore AI Agent Configuration
export const ContentCreatorAgent = new Agent({
  name: 'Creative-Writer-01',
  model: 'gemini-3.5-pro',
  temperature: 0.8,
  systemPrompt: \`You are an elite content strategist. 
Transform technical notes into compelling narratives.\`,
  tools: ['web_search', 'notion_api', 'database_read'],
  hooks: {
    beforeRun: async (ctx) => {
      await ctx.log.info('Compiling context...');
    },
    afterRun: async (ctx, result) => {
      return result.toMarkdown();
    }
  }
});

// Execute Pipeline
ContentCreatorAgent.run({
  topic: 'The future of decentralized AI networks',
  format: 'newsletter'
});`;

const MOCK_CONTENT = `# The Subnet Rebellion: Decentralized AI

The future isn't a single omnipotent brain. It's a swarm.

As we look towards the next decade of artificial intelligence, we see a shift from monolithic data centers to localized, democratized parameter networks.

- **Resilience:** No single point of failure.
- **Privacy:** Data never leaves the edge node.
- **Velocity:** Distributed training slashes epochs.

*Drafted by Agent-01. Pending human review.*`;

export function AgentWorkspace() {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  
  return (
    <div className="flex h-full bg-canvas">
      {/* Left Area: Hardcore Programming */}
      <div className="flex-1 flex flex-col border-r border-border min-w-0">
        {/* Editor Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border bg-[#020617]/50">
          <div className="flex items-center gap-4 text-[10px] font-mono tracking-wide uppercase text-text-muted">
            <div className="flex items-center gap-2 text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-1 rounded">
              <TerminalSquare size={12} />
              <span>agent.ts</span>
            </div>
            <div className="hover:text-text-primary cursor-pointer flex items-center gap-1 transition-colors">
              <Box size={12} />
              <span>dependencies.json</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-7 px-3 text-[10px] font-mono flex items-center gap-1.5 text-text-muted hover:text-text-primary bg-panel border border-border rounded transition-colors uppercase">
              <RotateCcw size={10} />
              Reset
            </button>
            <button className="h-7 px-3 text-[10px] font-mono font-bold flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded transition-colors uppercase shadow-lg shadow-brand-500/20">
              <Play size={10} fill="currentColor" />
              Run Agent
            </button>
          </div>
        </div>
        
        {/* Code Area */}
        <div className="flex-1 p-4 overflow-auto bg-[#020617] font-mono text-[11px] leading-relaxed text-text-primary">
          <pre className="outline-none" spellCheck={false}>
            <code>
              {MOCK_CODE}
            </code>
          </pre>
        </div>
      </div>

      {/* Right Area: Content Creation/Preview */}
      <div className="flex-1 flex flex-col min-w-0 bg-panel/20">
        <div className="h-14 flex items-center justify-between px-4 border-b border-border bg-panel/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-mono text-[10px] tracking-widest text-text-muted uppercase">Output_Stream</h3>
          </div>
          <div className="flex border border-border rounded overflow-hidden">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`p-1.5 ${activeTab === 'editor' ? 'bg-border text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
            >
              <Type size={14} />
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`p-1.5 ${activeTab === 'preview' ? 'bg-border text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
            >
              <SplitSquareHorizontal size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-invert prose-brand max-w-none"
          >
            <div className="outline-none min-h-full font-sans text-text-primary/90 space-y-6" contentEditable>
              {MOCK_CONTENT.split('\n').map((line, i) => (
                line.startsWith('# ') ? <h1 key={i} className="text-3xl font-semibold tracking-tight">{line.replace('# ', '')}</h1> :
                line.startsWith('- ') ? <p key={i} className="flex gap-2"><span className="text-brand-500">•</span> {line.replace('- ', '')}</p> :
                line.startsWith('*') ? <p key={i} className="text-xs text-text-muted italic border-l-2 border-brand-500 pl-3">{line.replace(/\*/g, '')}</p> :
                line.trim() === '' ? <br key={i} /> : 
                <p key={i} className="leading-7">{line}</p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Content Actions */}
        <div className="h-12 border-t border-border bg-[#020617] flex items-center justify-end px-4 gap-2">
          <button className="text-[10px] font-mono uppercase text-text-muted hover:text-text-primary flex items-center gap-1.5 px-2 py-1">
            <Settings2 size={12} /> Format
          </button>
          <button className="text-[10px] font-mono font-bold uppercase text-white bg-brand-600 hover:bg-brand-500 flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors">
            <Save size={12} /> Publish to DB
          </button>
        </div>
      </div>
    </div>
  );
}
