import { Plus, Play, MoreVertical, Database, CloudFog, Cpu, Globe } from 'lucide-react';

const NODES = [
  { id: 1, type: 'trigger', title: 'Webhook Received', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  { id: 2, type: 'action', title: 'Process Data', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  { id: 3, type: 'action', title: 'Agent Routing', icon: CloudFog, color: 'text-brand-500', bg: 'bg-brand-500/10', border: 'border-brand-500/30' },
  { id: 4, type: 'db', title: 'Save to Supabase', icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
];

export function WorkflowBuilder() {
  return (
    <div className="flex flex-col h-full bg-transparent relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Title block */}
      <div className="absolute top-6 left-6 z-10 text-[10px] font-mono text-text-muted bg-[#020617]/80 px-2 py-1 rounded border border-border">FLOW_DESIGNER_CANVAS</div>

      {/* Nodes Canvas (Mockup) */}
      <div className="relative flex-1 p-12 overflow-auto flex items-center justify-center">
        <div className="flex items-center gap-8">
          {NODES.map((node, i) => (
            <div key={node.id} className="flex items-center gap-8">
              <div 
                className={`w-48 bg-[#0f172a] border rounded-xl p-4 shadow-2xl transition-transform hover:-translate-y-1 cursor-pointer ${node.border.replace('border-', 'shadow-')}/10 border-border`}
              >
                <div className={`text-[10px] font-mono mb-2 uppercase ${node.color}`}>
                  {node.type.toUpperCase()}_NODE
                </div>
                <div className="text-sm font-medium">{node.title}</div>
                
                {node.type === 'action' && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-full bg-[#1e293b] h-1 rounded-full overflow-hidden">
                      <div className={`h-full w-[80%] ${node.bg.replace('/10', '')}`}></div>
                    </div>
                    <span className="text-[10px] font-mono">80%</span>
                  </div>
                )}
                {node.type !== 'action' && (
                  <div className="mt-4 pt-4 border-t border-border flex justify-end">
                    <div className={`w-2 h-2 rounded-full ${node.bg.replace('/10', '')}`}></div>
                  </div>
                )}
              </div>
              
              {/* Connector */}
              {i < NODES.length - 1 && (
                <div className="w-8 border-t-2 border-dashed border-[#334155]"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
