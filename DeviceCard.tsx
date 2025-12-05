import React from 'react';
import { Device, DeviceType } from './types';
import { useHome } from './HomeContext';
import { Lightbulb, Fan, ThermometerSnowflake, Zap, Trash2 } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const { toggleDevice, setDeviceValue, isDemoMode, connection, deleteDevice } = useHome();

  const getIcon = () => {
    switch (device.type) {
      case DeviceType.LIGHT:
        return <Lightbulb className={`w-8 h-8 transition-all duration-500 ${device.isOn ? 'text-yellow-500 dark:text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]' : 'text-slate-400 dark:text-slate-500'}`} />;
      case DeviceType.FAN:
        return <Fan className={`w-8 h-8 transition-all duration-500 ${device.isOn ? 'animate-spin text-cyan-500 dark:text-cyan-300' : 'text-slate-400 dark:text-slate-500'}`} style={{ animationDuration: device.isOn ? `${2000 - (device.value * 15)}ms` : '0ms' }} />;
      case DeviceType.AC:
        return <ThermometerSnowflake className={`w-8 h-8 transition-all duration-500 ${device.isOn ? 'text-blue-500 dark:text-blue-300' : 'text-slate-400 dark:text-slate-500'}`} />;
      default:
        return <Zap className={`w-8 h-8 transition-all duration-500 ${device.isOn ? 'text-violet-500 dark:text-violet-300' : 'text-slate-400 dark:text-slate-500'}`} />;
    }
  };

  const getGradient = () => {
    if (!device.isOn) return 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50';
    
    // Light mode active gradients vs Dark mode active gradients
    switch (device.type) {
      case DeviceType.LIGHT:
        return 'bg-amber-50 dark:bg-gradient-to-br dark:from-amber-500/20 dark:to-orange-600/10 border-amber-200 dark:border-amber-500/50 shadow-md dark:shadow-[0_0_20px_rgba(245,158,11,0.15)]';
      case DeviceType.FAN:
        return 'bg-cyan-50 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-blue-600/10 border-cyan-200 dark:border-cyan-500/50 shadow-md dark:shadow-[0_0_20px_rgba(6,182,212,0.15)]';
      case DeviceType.AC:
        return 'bg-blue-50 dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-indigo-600/10 border-blue-200 dark:border-blue-500/50 shadow-md dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]';
      default:
        return 'bg-violet-50 dark:bg-gradient-to-br dark:from-violet-500/20 dark:to-purple-600/10 border-violet-200 dark:border-violet-500/50 shadow-md dark:shadow-[0_0_20px_rgba(139,92,246,0.15)]';
    }
  };

  const handleToggle = () => {
    toggleDevice(device.id);
  };

  const isDisabled = !isDemoMode && !connection.isConnected;

  return (
    <div
      className={`relative p-6 rounded-3xl border glass-panel transition-all duration-300 group ${getGradient()} ${isDisabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl'}`}
    >
      {/* Delete Button (Visible on Hover) */}
      <button 
        onClick={(e) => { e.stopPropagation(); deleteDevice(device.id); }}
        className="absolute top-4 right-4 p-2 rounded-full text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all z-10"
        title="Delete Device"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl transition-colors duration-300 ${device.isOn ? 'bg-white dark:bg-white/10' : 'bg-slate-100 dark:bg-slate-900/50'}`}>
          {getIcon()}
        </div>
        <button
          onClick={(e) => {
             e.stopPropagation();
             if (!isDisabled) handleToggle();
          }}
          disabled={isDisabled}
          className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-violet-500 ${
            device.isOn ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <span
            className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
              device.isOn ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{device.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{device.roomId.replace('-', ' ')}</p>
      </div>

      {/* Sliders for Analog Control */}
      {(device.type === DeviceType.LIGHT || device.type === DeviceType.FAN) && (
        <div className={`mt-4 transition-opacity duration-300 ${device.isOn ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
           <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>{device.type === DeviceType.LIGHT ? 'Brightness' : 'Speed'}</span>
              <span>{device.value}%</span>
           </div>
           <input 
              type="range" 
              min="0" 
              max="100" 
              value={device.value}
              onChange={(e) => setDeviceValue(device.id, parseInt(e.target.value))}
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${device.type === DeviceType.LIGHT ? 'text-amber-500' : 'text-cyan-500'}`}
              style={{ background: 'rgba(128,128,128,0.2)' }}
           />
        </div>
      )}

      {device.type === DeviceType.AC && (
         <div className={`mt-4 transition-opacity duration-300 ${device.isOn ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
             <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900/40 rounded-lg p-2">
                <button onClick={() => setDeviceValue(device.id, device.value - 1)} className="text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 p-1 rounded">-</button>
                <span className="text-slate-800 dark:text-white font-mono text-lg">{device.value}°C</span>
                <button onClick={() => setDeviceValue(device.id, device.value + 1)} className="text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 p-1 rounded">+</button>
             </div>
         </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-3">
         <span className={`text-xs font-bold tracking-wider px-2 py-1 rounded-md ${
           device.isOn 
           ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' 
           : 'bg-slate-200 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'
          }`}>
            {device.isOn ? 'ON' : 'OFF'}
         </span>
      </div>
    </div>
  );
};

export default DeviceCard;