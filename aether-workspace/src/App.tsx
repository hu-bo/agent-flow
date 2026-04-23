import { useState } from 'react';
import { Network, Database, TerminalSquare, MessageSquare, Plus, Settings, Hexagon, Search } from 'lucide-react';
import { ChatView } from './components/views/ChatView';
import { AgentWorkspace } from './components/views/AgentWorkspace';
import { WorkflowBuilder } from './components/views/WorkflowBuilder';
import { DatabaseView } from './components/views/DatabaseView';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type ViewType = 'chat' | 'agent' | 'workflow' | 'database';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('agent');

  const VIEWS: Record<ViewType, React.ReactNode> = {
    chat: <ChatView />,
    agent: <AgentWorkspace />,
    workflow: <WorkflowBuilder />,
    database: <DatabaseView />
  };

  const SIDEBAR_ITEMS = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'agent', icon: TerminalSquare, label: 'Agent IDE' },
    { id: 'workflow', icon: Network, label: 'Workflows' },
    { id: 'database', icon: Database, label: 'Database' },
  ] as const;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-text-primary selection:bg-brand-500/30">
      {/* Leftmost App Bar */}
      <div className="w-16 shrink-0 flex flex-col items-center py-6 border-r border-border bg-[#020617] gap-8 z-20">
        <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold text-xl mb-2">
          Ω
        </div>
        
        <div className="flex-1 flex flex-col items-center gap-6 w-full px-2 opacity-80 text-sm">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "p-2 rounded-md transition-colors relative group",
                activeView === item.id 
                  ? "bg-panel text-white opacity-100" 
                  : "text-text-muted hover:text-white"
              )}
            >
              <item.icon size={18} />
              {activeView === item.id && (
                <motion.div 
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1 bottom-1 w-0.5 bg-brand-500 rounded-r-sm"
                />
              )}
              
              {/* Tooltip */}
              <div className="absolute left-12 px-2 py-1 bg-panel border border-border rounded text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {item.label}
              </div>
            </button>
          ))}
        </div>

        <button className="mt-auto mb-2 opacity-40 hover:opacity-100 cursor-pointer transition-opacity">
          <Settings size={20} />
        </button>
      </div>

      {/* Secondary Sidebar (Contextual) */}
      <div className="w-64 shrink-0 border-r border-border bg-[#020617] flex flex-col z-10 hidden md:flex">
        <div className="h-14 flex items-center px-4 border-b border-border bg-panel/50">
          <h2 className="font-semibold text-sm tracking-tight uppercase font-mono text-text-muted">{activeView}_EXPLORER</h2>
        </div>
        
        <div className="p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              placeholder={`Search ${activeView}s...`} 
              className="w-full h-8 pl-9 pr-3 text-xs bg-panel border border-border rounded outline-none focus:border-brand-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          <div className="px-2 py-1.5 text-[10px] font-mono text-text-muted mt-2 mb-1">RECENT</div>
          {[1, 2, 3].map((i) => (
            <button key={i} className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-text-muted hover:text-text-primary hover:bg-panel rounded-lg group transition-colors text-left border border-transparent hover:border-border-subtle">
              <span className="truncate font-mono">NODE_{i}</span>
              <span className="opacity-0 group-hover:opacity-100"><MoreHorizontal size={12} /></span>
            </button>
          ))}
        </div>
        
        <div className="p-3 border-t border-border bg-[#020617]">
          <button className="w-full flex items-center justify-center gap-2 h-8 rounded border border-dashed border-border-subtle text-[10px] font-mono text-text-muted hover:text-text-primary hover:bg-panel hover:border-brand-500/50 transition-colors uppercase">
            <Plus size={12} /> NEW_{activeView}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-canvas overflow-hidden flex flex-col">
        <header className="h-14 border-b border-border flex items-center px-6 justify-between bg-panel/50 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono uppercase tracking-widest text-text-muted">Workspace /</span>
            <h1 className="text-sm font-semibold tracking-tight">AGENT_COLLAB_v4.0</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full border-2 border-[#0f172a] bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">JD</div>
              <div className="w-7 h-7 rounded-full border-2 border-[#0f172a] bg-brand-500 flex items-center justify-center text-[10px] font-bold text-white">AS</div>
              <div className="w-7 h-7 rounded-full border-2 border-[#0f172a] bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white">RB</div>
            </div>
            <button className="px-3 py-1 bg-white text-black text-xs font-bold rounded hover:bg-slate-200 transition-colors">PUBLISH</button>
          </div>
        </header>
        
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {VIEWS[activeView]}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="h-8 bg-brand-600 px-4 flex items-center justify-between text-[10px] font-mono font-bold uppercase text-white shrink-0 z-10">
          <div className="flex gap-4">
            <span>Status: Operational</span>
            <span>CPU: 12%</span>
            <span>Mem: 4.2GB</span>
          </div>
          <div className="flex gap-4">
            <span>Latency: 24ms</span>
            <span>Nodes: 12 Active</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Temporary MoreHorizontal import fallback for App.tsx
function MoreHorizontal(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
}
