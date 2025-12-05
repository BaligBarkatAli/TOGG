import React from 'react';
import { useHome } from './HomeContext';
import { X, User as UserIcon, Calendar, Mail } from 'lucide-react';

interface UserDataSheetProps {
  onClose: () => void;
}

const UserDataSheet: React.FC<UserDataSheetProps> = ({ onClose }) => {
  const { userHistory } = useHome();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
           <div>
             <h3 className="text-2xl font-bold text-slate-900 dark:text-white">User Data Sheet</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Registry of all users who have accessed the system.</p>
           </div>
           <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content - Table */}
        <div className="overflow-y-auto p-0">
           {userHistory.length === 0 ? (
             <div className="p-10 text-center text-slate-500">
               <p>No user history found.</p>
             </div>
           ) : (
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Contact</th>
                    <th className="p-4 font-semibold">Last Access</th>
                    <th className="p-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {userHistory.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="w-full h-full p-2 text-slate-400" />
                            )}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{u.username}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Mail className="w-4 h-4 text-violet-500" />
                          <span className="text-sm">{u.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-mono">{formatDate(u.lastLogin)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                           Registered
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           )}
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
           Secure User Registry • TOGG System
        </div>
      </div>
    </div>
  );
};

export default UserDataSheet;