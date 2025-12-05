import React, { useState } from 'react';
import { X, Plus, Lightbulb, Fan, ThermometerSnowflake, Zap } from 'lucide-react';
import { DeviceType } from './types';
import { useHome } from './HomeContext';

interface AddDeviceModalProps {
  onClose: () => void;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ onClose }) => {
  const { addDevice } = useHome();
  const [name, setName] = useState('');
  const [type, setType] = useState<DeviceType>(DeviceType.LIGHT);
  const [roomId, setRoomId] = useState('living-room');
  const [onCommand, setOnCommand] = useState('CMD:ON');
  const [offCommand, setOffCommand] = useState('CMD:OFF');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !onCommand || !offCommand) return;

    addDevice({
      name,
      type,
      roomId,
      onCommand,
      offCommand
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Add Device</h3>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Device Type Selection */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[DeviceType.LIGHT, DeviceType.FAN, DeviceType.AC, DeviceType.SWITCH].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    type === t 
                    ? 'bg-violet-100 dark:bg-violet-600/20 border-violet-500 text-violet-600 dark:text-violet-300' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {t === DeviceType.LIGHT && <Lightbulb className="w-6 h-6 mb-1" />}
                  {t === DeviceType.FAN && <Fan className="w-6 h-6 mb-1" />}
                  {t === DeviceType.AC && <ThermometerSnowflake className="w-6 h-6 mb-1" />}
                  {t === DeviceType.SWITCH && <Zap className="w-6 h-6 mb-1" />}
                  <span className="text-[10px] font-bold">{t}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Device Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bedside Lamp"
                className="w-full bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 border focus:border-violet-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Room ID</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 border focus:border-violet-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none transition-all appearance-none"
              >
                <option value="living-room">Living Room</option>
                <option value="bedroom">Bedroom</option>
                <option value="kitchen">Kitchen</option>
                <option value="bathroom">Bathroom</option>
                <option value="office">Office</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">On Command</label>
                  <input
                    type="text"
                    required
                    value={onCommand}
                    onChange={(e) => setOnCommand(e.target.value)}
                    placeholder="L1:ON"
                    className="w-full bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 border focus:border-violet-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 font-mono text-sm focus:outline-none transition-all"
                  />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Off Command</label>
                  <input
                    type="text"
                    required
                    value={offCommand}
                    onChange={(e) => setOffCommand(e.target.value)}
                    placeholder="L1:OFF"
                    className="w-full bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 border focus:border-violet-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 font-mono text-sm focus:outline-none transition-all"
                  />
               </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Device
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDeviceModal;