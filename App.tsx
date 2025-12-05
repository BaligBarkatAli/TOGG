import React, { useState } from 'react';
import { HomeProvider, useHome } from './HomeContext';
import ConnectionPanel from './ConnectionPanel';
import DeviceCard from './DeviceCard';
import RecentLog from './RecentLog';
import UsageStats from './UsageStats';
import SignIn from './SignIn';
import AddDeviceModal from './AddDeviceModal';
import UserDataSheet from './UserDataSheet';
import AiChat from './AiChat';
import { Mic, Thermometer, Droplets, LogOut, User as UserIcon, Sun, Moon, Plus, Bot, FileText } from 'lucide-react';

const Header: React.FC<{ onOpenDataSheet: () => void }> = ({ onOpenDataSheet }) => {
   const { isListening, startVoiceControl, stopVoiceControl, environment, user, logout, theme, toggleTheme, toggleAiChat } = useHome();

   return (
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white/50 dark:bg-slate-800/30 p-4 md:p-6 rounded-3xl border border-slate-200 dark:border-white/5 backdrop-blur-xl transition-colors duration-300">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 tracking-tighter flex items-center gap-3">
              TOGG
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Next-Gen Home Control</p>
          </div>

          <div className="flex flex-col-reverse md:flex-row items-end md:items-center gap-4">
             {/* Environment Widget */}
             <div className="flex items-center gap-4 px-5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 shadow-inner">
                <div className="flex items-center gap-2">
                   <Thermometer className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                   <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Temp</span>
                      <span className="font-mono text-slate-800 dark:text-white font-bold">{environment.temperature}°C</span>
                   </div>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex items-center gap-2">
                   <Droplets className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                   <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Humidity</span>
                      <span className="font-mono text-slate-800 dark:text-white font-bold">{environment.humidity}%</span>
                   </div>
                </div>
             </div>
             
             {/* Theme Toggle */}
             <button 
                onClick={toggleTheme}
                className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Toggle Theme"
             >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>

             {/* AI Toggle */}
             <button 
                onClick={toggleAiChat}
                className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-fuchsia-600 dark:text-fuchsia-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="AI Assistant"
             >
                <Bot className="w-5 h-5" />
             </button>

             {/* Voice Button */}
             <button
               onMouseDown={startVoiceControl}
               onMouseUp={stopVoiceControl}
               onTouchStart={startVoiceControl}
               onTouchEnd={stopVoiceControl}
               className={`relative group px-6 py-3 rounded-full flex items-center gap-2 font-semibold transition-all duration-300 shadow-lg ${
                 isListening 
                 ? 'bg-red-500 text-white shadow-red-500/50 scale-105' 
                 : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/40'
               }`}
             >
               {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
               <span className="hidden md:inline">{isListening ? 'Listening...' : 'Voice Command'}</span>
               {/* Tooltip hint */}
               <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Hold to speak
               </span>
             </button>

             {/* User Profile */}
             <div className="flex items-center gap-3 pl-2 md:border-l border-slate-200 dark:border-slate-700">
               <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{user?.username}</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={onOpenDataSheet} className="text-xs text-slate-500 hover:text-violet-500 dark:hover:text-violet-400 flex items-center gap-1" title="View User Data Sheet">
                      <FileText className="w-3 h-3" /> Data
                    </button>
                    <button onClick={logout} className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 flex items-center gap-1">
                      <LogOut className="w-3 h-3" /> Sign Out
                    </button>
                  </div>
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-slate-300 dark:border-slate-600">
                  {user?.avatar ? (
                     <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                     <UserIcon className="w-full h-full p-2 text-slate-400" />
                  )}
               </div>
             </div>
          </div>
      </header>
   );
};

const DashboardContent: React.FC = () => {
  const { devices } = useHome();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDataSheetOpen, setIsDataSheetOpen] = useState(false);

  return (
    <div className="min-h-screen p-4 md:p-6 bg-slate-50 dark:bg-[#0b0f19] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-[#0b0f19] dark:to-[#0b0f19] transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <Header onOpenDataSheet={() => setIsDataSheetOpen(true)} />

        {/* Connection Manager */}
        <ConnectionPanel />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Devices Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Devices</h2>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-500 bg-slate-200 dark:bg-slate-800/50 px-3 py-1 rounded-full">{devices.length} Active</span>
               </div>
               
               <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg"
               >
                  <Plus className="w-4 h-4" />
                  Add Device
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>

            {/* Charts Section */}
            <div className="mt-8">
               <UsageStats />
            </div>
          </div>

          {/* Sidebar / Logs */}
          <div className="lg:col-span-4 space-y-6">
             <RecentLog />
             
             {/* Quick Tips or Info */}
             <div className="bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-600/20 dark:to-fuchsia-600/20 border border-violet-200 dark:border-violet-500/30 rounded-2xl p-5 backdrop-blur-sm shadow-sm dark:shadow-xl">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                   <Bot className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                   AI Assistance
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                   TOGG AI can help you control devices or answer questions.
                </p>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-4 italic">
                   <li>"Set living room light to 50%"</li>
                   <li>"It's too hot in here"</li>
                   <li>"How do I pair my ESP32?"</li>
                </ul>
             </div>
          </div>

        </div>
      </div>

      <AiChat />
      {isAddModalOpen && <AddDeviceModal onClose={() => setIsAddModalOpen(false)} />}
      {isDataSheetOpen && <UserDataSheet onClose={() => setIsDataSheetOpen(false)} />}
    </div>
  );
};

const MainWrapper: React.FC = () => {
  const { user } = useHome();
  return user ? <DashboardContent /> : <SignIn />;
};

const App: React.FC = () => {
  return (
    <HomeProvider>
      <MainWrapper />
    </HomeProvider>
  );
};

export default App;