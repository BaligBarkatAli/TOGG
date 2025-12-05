import React from 'react';
import { useHome } from './HomeContext';
import { Clock, Activity, Mic, AlertCircle, Radio } from 'lucide-react';

const RecentLog: React.FC = () => {
  const { logs, clearLogs } = useHome();

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getIcon = (action: string) => {
     if (action === 'VOICE_COMMAND') return <Mic className="w-3 h-3 text-white" />;
     if (action === 'ERROR') return <AlertCircle className="w-3 h-3 text-white" />;
     if (action === 'CONNECTED') return <Radio className="w-3 h-3 text-white" />;
     return <Activity className="w-3 h-3 text-white" />;
  };

  return (
    <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 backdrop-blur-md h-[500px] flex flex-col shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-violet-500 dark:text-violet-400" />
          Live Feed
        </h3>
        {logs.length > 0 && (
          <button onClick={clearLogs} className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Clear
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 space-y-2">
             <Clock className="w-10 h-10 opacity-20" />
             <p className="text-sm">Waiting for events...</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="group flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
               <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
                  log.action === 'TURNED_ON' ? 'bg-green-500' :
                  log.action === 'TURNED_OFF' ? 'bg-slate-500 dark:bg-slate-600' :
                  log.action === 'ERROR' ? 'bg-red-500' : 
                  log.action === 'VOICE_COMMAND' ? 'bg-fuchsia-500' : 'bg-blue-500'
               }`}>
                  {getIcon(log.action)}
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                     {log.deviceName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                     {log.action.replace('_', ' ')}
                     {log.details && <span className="text-fuchsia-600 dark:text-fuchsia-300 ml-1"> - {log.details}</span>}
                  </p>
               </div>
               <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 opacity-60 group-hover:opacity-100">
                  {formatTime(log.timestamp)}
               </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentLog;