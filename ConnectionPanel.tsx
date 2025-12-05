import React, { useState } from 'react';
import { useHome } from './HomeContext';
import { Bluetooth, BluetoothOff, Wifi, WifiOff, ShieldAlert, Zap, Globe, MessageCircleQuestion, Server } from 'lucide-react';

const ConnectionPanel: React.FC = () => {
  const { connection, connectBluetooth, connectWifi, connectGateway, disconnect, isDemoMode, setDemoMode, toggleAiChat } = useHome();
  const [activeTab, setActiveTab] = useState<'BLE' | 'WIFI' | 'GATEWAY'>('BLE');
  const [ipAddress, setIpAddress] = useState('192.168.4.1');
  const [gatewayUrl, setGatewayUrl] = useState('demo');

  const handleWifiConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (ipAddress) connectWifi(ipAddress);
  };

  const handleGatewayConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (gatewayUrl) connectGateway(gatewayUrl);
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-8 backdrop-blur-md transition-all duration-300 shadow-sm">
      
      {/* Header / Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             {connection.isConnected 
                ? (connection.method === 'BLE' ? <Bluetooth className="text-blue-500 dark:text-blue-400"/> : 
                   connection.method === 'WIFI' ? <Wifi className="text-emerald-500 dark:text-emerald-400"/> :
                   <Server className="text-fuchsia-500 dark:text-fuchsia-400"/>)
                : <Zap className="text-amber-500 dark:text-amber-400"/>
             }
             Connectivity Hub
           </h2>
           <p className="text-sm text-slate-500 dark:text-slate-400">Connect to Arduino, ESP32, or Gateway</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => !connection.isConnected && setActiveTab('BLE')}
            disabled={connection.isConnected}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'BLE' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            } ${connection.isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Bluetooth
          </button>
          <button
            onClick={() => !connection.isConnected && setActiveTab('WIFI')}
            disabled={connection.isConnected}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'WIFI' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            } ${connection.isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            WiFi
          </button>
          <button
            onClick={() => !connection.isConnected && setActiveTab('GATEWAY')}
            disabled={connection.isConnected}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'GATEWAY' 
              ? 'bg-fuchsia-600 text-white shadow-lg' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            } ${connection.isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Gateway (Arduino)
          </button>
        </div>
      </div>

      {/* Main Connection Area */}
      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Status Display */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className={`p-4 rounded-full transition-all duration-500 ${
              connection.isConnected 
                ? (connection.method === 'BLE' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 
                   connection.method === 'WIFI' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                   'bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400')
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {connection.isConnected 
                ? (connection.method === 'BLE' ? <Bluetooth className="w-8 h-8" /> : 
                   connection.method === 'WIFI' ? <Wifi className="w-8 h-8" /> :
                   <Server className="w-8 h-8" />) 
                : (activeTab === 'BLE' ? <BluetoothOff className="w-8 h-8" /> : 
                   activeTab === 'WIFI' ? <WifiOff className="w-8 h-8" /> : 
                   <Server className="w-8 h-8" />)
              }
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${connection.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  {connection.isConnected ? 'System Online' : 'System Offline'}
                </span>
              </div>
              <p className="text-slate-900 dark:text-white text-lg font-medium truncate max-w-[200px] md:max-w-none">
                 {connection.isConnecting 
                   ? 'Attempting connection...' 
                   : connection.isConnected 
                     ? `Connected via ${connection.method} to ${connection.details}` 
                     : activeTab === 'BLE' ? 'Ready to pair BLE Device' : activeTab === 'WIFI' ? 'Enter IP to connect' : 'Enter Gateway WebSocket'}
              </p>
              {connection.error && (
                <div className="mt-1">
                  <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 animate-pulse">
                    <ShieldAlert className="w-3 h-3" />
                    {connection.error}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-col w-full md:w-auto gap-3">
             
             {!connection.isConnected ? (
                activeTab === 'BLE' ? (
                  <button
                    onClick={connectBluetooth}
                    disabled={connection.isConnecting}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {connection.isConnecting ? <Globe className="animate-spin w-5 h-5"/> : <Bluetooth className="w-5 h-5" />}
                    {connection.isConnecting ? 'Pairing...' : 'Find Devices'}
                  </button>
                ) : activeTab === 'WIFI' ? (
                  <form onSubmit={handleWifiConnect} className="flex gap-2 w-full md:w-auto">
                    <input 
                      type="text" 
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      placeholder="IP Address"
                      className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full md:w-64"
                    />
                    <button
                      type="submit"
                      disabled={connection.isConnecting}
                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {connection.isConnecting ? <Globe className="animate-spin w-5 h-5"/> : <Wifi className="w-5 h-5" />}
                      Connect
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleGatewayConnect} className="flex gap-2 w-full md:w-auto">
                    <input 
                      type="text" 
                      value={gatewayUrl}
                      onChange={(e) => setGatewayUrl(e.target.value)}
                      placeholder="ws://..."
                      className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 w-full md:w-64"
                    />
                    <button
                      type="submit"
                      disabled={connection.isConnecting}
                      className="flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg shadow-fuchsia-600/20 disabled:opacity-50"
                    >
                      {connection.isConnecting ? <Globe className="animate-spin w-5 h-5"/> : <Server className="w-5 h-5" />}
                      Link
                    </button>
                  </form>
                )
             ) : (
                <button
                  onClick={disconnect}
                  className="flex items-center justify-center gap-2 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 hover:bg-red-500 hover:text-white text-red-500 dark:text-red-400 px-8 py-3 rounded-xl transition-all font-bold"
                >
                  <WifiOff className="w-5 h-5" />
                  Disconnect
                </button>
             )}

             <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xs text-slate-500">or</span>
                <button
                  onClick={() => setDemoMode(!isDemoMode)}
                  className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                      isDemoMode 
                      ? 'bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/50 text-amber-600 dark:text-amber-400' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isDemoMode ? 'Demo Mode On' : 'Enable Demo Mode'}
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConnectionPanel;