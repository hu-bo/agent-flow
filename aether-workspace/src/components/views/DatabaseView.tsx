import { Search, Filter, ArrowDownUp, MoreHorizontal, DatabaseBackup } from 'lucide-react';
import { cn } from '../../lib/utils';

const COLUMNS = ['ID', 'Prompt', 'Output', 'Status', 'Cost', 'Tokens', 'Created At'];
const DATA = [
  { id: 'usr_01', prompt: 'Write a thread about AI...', output: 'The Subnet Rebellion...', status: 'Success', cost: '$0.002', tokens: '412', date: 'Just now' },
  { id: 'usr_02', prompt: 'Generate tailwind class...', output: 'bg-zinc-900 border...', status: 'Success', cost: '$0.001', tokens: '128', date: '5m ago' },
  { id: 'usr_03', prompt: 'Analyze database schema', output: 'The schema contains...', status: 'Failed', cost: '$0.000', tokens: '0', date: '1h ago' },
  { id: 'usr_04', prompt: 'List all agents', output: '[ "Creator", "Developer" ]', status: 'Success', cost: '$0.001', tokens: '102', date: '2h ago' },
];

export function DatabaseView() {
  return (
    <div className="flex flex-col h-full bg-[#020617] border-l border-border">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-border bg-panel/50">
        <div className="flex items-center gap-3">
          <DatabaseBackup size={16} className="text-emerald-500" />
          <h2 className="font-semibold text-sm tracking-tight uppercase font-mono text-text-muted">LLM_LOGS</h2>
          <span className="px-2 py-0.5 rounded border border-border text-[10px] text-text-muted">4 Rows</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              placeholder="Search records..." 
              className="h-8 pl-8 pr-3 text-xs bg-canvas border border-border rounded outline-none focus:border-brand-500/50 w-64"
            />
          </div>
          <button className="h-8 px-3 text-xs flex items-center gap-2 text-text-muted hover:text-text-primary bg-canvas border border-border rounded">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-panel/20 text-[10px] font-mono text-text-muted uppercase tracking-tighter">
              {COLUMNS.map((col, i) => (
                <th key={col} className={cn("p-4 whitespace-nowrap font-normal", i === 0 && "w-32")}>
                  <div className="flex items-center gap-2">
                    {col}
                    <ArrowDownUp size={12} className="opacity-50" />
                  </div>
                </th>
              ))}
              <th className="p-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {DATA.map((row, i) => (
              <tr key={i} className="border-b border-[#0f172a]/50 hover:bg-[#0f172a]/30 transition-colors group">
                <td className="p-4 text-brand-400">{row.id}</td>
                <td className="p-4 truncate max-w-[200px] text-text-primary">{row.prompt}</td>
                <td className="p-4 truncate max-w-[250px] text-text-muted">{row.output}</td>
                <td className="p-4">
                  <span className={cn(
                    "px-1 py-0.5 rounded text-[10px]",
                    row.status === 'Success' 
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500"
                  )}>
                    {row.status}
                  </span>
                </td>
                <td className="p-4 text-text-muted opacity-50">{row.cost}</td>
                <td className="p-4 text-text-muted opacity-50">{row.tokens}</td>
                <td className="p-4 text-text-muted text-right opacity-50">{row.date}</td>
                <td className="p-4 text-right">
                  <MoreHorizontal size={14} className="text-text-muted opacity-0 group-hover:opacity-100 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
