import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Device, LogEntry, ConnectionState, EnvironmentState, User, ConnectionMethod, DeviceType, ChatMessage, GatewayMessage } from './types';
import { INITIAL_DEVICES } from './constants';
import { bleService } from './bleService';
import { wifiService } from './wifiService';
import { gatewayService } from './gatewayService';
import { aiService, AiContext } from './aiService';
import { storageService } from './storageService';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

interface HomeContextType {
  user: User | null;
  userHistory: User[];
  login: (email: string, username: string) => void;
  logout: () => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Devices
  devices: Device[];
  addDevice: (device: Omit<Device, 'id' | 'isOn' | 'value'>) => void;
  deleteDevice: (id: string) => void;
  toggleDevice: (deviceId: string, state?: boolean) => Promise<void>;
  setDeviceValue: (deviceId: string, value: number) => Promise<void>;

  // Data & Connection
  logs: LogEntry[];
  connection: ConnectionState;
  environment: EnvironmentState;
  connectBluetooth: () => Promise<void>;
  connectWifi: (ip: string) => Promise<void>;
  connectGateway: (url: string) => Promise<void>;
  disconnect: () => void;
  clearLogs: () => void;
  
  // Modes & AI
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  isListening: boolean;
  startVoiceControl: () => void;
  stopVoiceControl: () => void;
  
  // AI Chat
  isAiOpen: boolean;
  toggleAiChat: () => void;
  chatHistory: ChatMessage[];
  sendAiMessage: (text: string) => Promise<void>;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export const HomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [userHistory, setUserHistory] = useState<User[]>([]);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // App State
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connection, setConnection] = useState<ConnectionState>({
    isConnected: false,
    method: null,
    details: null,
    error: null,
    isConnecting: false,
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [environment, setEnvironment] = useState<EnvironmentState>({ temperature: 24.5, humidity: 45 });
  const [isListening, setIsListening] = useState(false);
  
  // Chat State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: 'welcome', sender: 'ai', text: 'Hello! I am TOGG AI. I have full control over your home. How can I help?', timestamp: Date.now() }
  ]);

  const recognitionRef = useRef<any>(null);
  
  // Refs for throttling
  const lastCommandTimeRef = useRef<number>(0);
  const debounceTimerRef = useRef<any>(null);

  // Initialize: Load Theme and User from Storage
  useEffect(() => {
    // Theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // User Persistence
    const savedUser = storageService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      addLog('system', 'System', 'LOGIN', `Welcome back, ${savedUser.username}`);
    }
    
    // Load History
    setUserHistory(storageService.getUserHistory());

  }, [theme]); // Intentionally not including addLog to avoid circular dependency on mount

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleAiChat = () => setIsAiOpen(prev => !prev);

  // Login Logic
  const login = (email: string, username: string) => {
    const newUser: User = {
      id: generateId(),
      email,
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      lastLogin: Date.now(),
      role: 'user'
    };
    
    setUser(newUser);
    storageService.saveCurrentUser(newUser);
    
    // Update History
    storageService.addToHistory(newUser);
    setUserHistory(storageService.getUserHistory());
    
    addLog('system', 'System', 'LOGIN', `User ${username} logged in`);
  };

  const logout = () => {
    if (connection.isConnected) disconnect();
    addLog('system', 'System', 'LOGOUT', `User ${user?.username} logged out`);
    storageService.clearCurrentUser();
    setUser(null);
  };

  // Speak helper
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Add a log entry
  const addLog = useCallback((deviceId: string, deviceName: string, action: LogEntry['action'], details?: string) => {
    const newLog: LogEntry = {
      id: generateId(),
      deviceId,
      deviceName,
      action,
      timestamp: Date.now(),
      details,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 100));
  }, []);

  // Handle incoming BLE data
  const handleIncomingBleData = useCallback((data: string) => {
    const cleanData = data.trim();
    if (cleanData.startsWith('T:')) {
      const temp = parseFloat(cleanData.substring(2));
      if (!isNaN(temp)) setEnvironment(prev => ({ ...prev, temperature: temp }));
    }
  }, []);

  // Handle incoming Gateway/Arduino Message
  const handleGatewayMessage = useCallback((msg: GatewayMessage) => {
    console.log("Received Gateway Message:", msg);
    
    setDevices(prevDevices => {
      const device = prevDevices.find(d => d.id === msg.deviceId);
      if (!device) return prevDevices;

      // Only update if state actually changed
      const stateChanged = msg.state !== undefined && msg.state !== device.isOn;
      const valueChanged = msg.value !== undefined && msg.value !== device.value;

      if (!stateChanged && !valueChanged) return prevDevices;

      // Update log
      if (msg.source === 'arduino') {
        const action = msg.state ? 'TURNED_ON' : 'TURNED_OFF';
        const logAction = stateChanged ? (msg.state ? 'TURNED_ON' : 'TURNED_OFF') : 'VALUE_CHANGE';
        addLog(device.id, device.name, 'PHYSICAL_SWITCH', stateChanged ? (msg.state ? 'On (Arduino)' : 'Off (Arduino)') : `Value ${msg.value}`);
        speak(`${device.name} turned ${msg.state ? 'on' : 'off'} manually`);
      }

      return prevDevices.map(d => {
        if (d.id === msg.deviceId) {
          return {
            ...d,
            isOn: msg.state !== undefined ? msg.state : d.isOn,
            value: msg.value !== undefined ? msg.value : d.value
          };
        }
        return d;
      });
    });
  }, [addLog]);

  // Handle unexpected Disconnection
  const handleDisconnectEvent = useCallback(() => {
    setConnection({
      isConnected: false,
      method: null,
      details: null,
      error: 'Device Disconnected unexpectedly',
      isConnecting: false,
    });
    addLog('system', 'System', 'DISCONNECTED', 'Connection lost');
    speak('Device disconnected');
  }, [addLog]);

  // Connect BLE
  const connectBluetooth = async () => {
    setConnection((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      const deviceName = await bleService.connect(handleIncomingBleData, handleDisconnectEvent);
      setConnection({
        isConnected: true,
        method: 'BLE',
        details: deviceName,
        error: null,
        isConnecting: false,
      });
      setIsDemoMode(false);
      addLog('system', 'System', 'CONNECTED', `via Bluetooth to ${deviceName}`);
      speak('Bluetooth connected successfully');
    } catch (err: any) {
      const isUserCancellation = err.name === 'NotFoundError' || err.message?.includes('cancelled');
      setConnection((prev) => ({
        ...prev,
        isConnecting: false,
        error: isUserCancellation ? null : (err.message || 'Failed to connect BLE'),
      }));
      if (!isUserCancellation) speak('Failed to connect Bluetooth');
    }
  };

  // Connect WiFi
  const connectWifi = async (ip: string) => {
    setConnection((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      const confirmedIp = await wifiService.connect(ip);
      setConnection({
        isConnected: true,
        method: 'WIFI',
        details: confirmedIp,
        error: null,
        isConnecting: false,
      });
      setIsDemoMode(false);
      addLog('system', 'System', 'CONNECTED', `via WiFi to ${confirmedIp}`);
      speak('WiFi connected');
    } catch (err: any) {
      setConnection((prev) => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Failed to connect WiFi',
      }));
      speak('Failed to connect WiFi');
    }
  };

  // Connect Gateway
  const connectGateway = async (url: string) => {
    setConnection((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      const confirmedUrl = await gatewayService.connect(url, handleGatewayMessage, handleDisconnectEvent);
      setConnection({
        isConnected: true,
        method: 'GATEWAY',
        details: confirmedUrl === 'demo' ? 'Arduino Gateway (Sim)' : 'Arduino Gateway',
        error: null,
        isConnecting: false,
      });
      setIsDemoMode(false);
      addLog('system', 'System', 'CONNECTED', `via Gateway`);
      speak('Gateway connected. Listening for Arduino events.');
    } catch (err: any) {
      setConnection((prev) => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Failed to connect Gateway',
      }));
      speak('Failed to connect Gateway');
    }
  };

  const disconnect = useCallback(() => {
    if (connection.method === 'BLE') bleService.disconnect();
    else if (connection.method === 'WIFI') wifiService.disconnect();
    else if (connection.method === 'GATEWAY') gatewayService.disconnect();

    setConnection({
      isConnected: false,
      method: null,
      details: null,
      error: null,
      isConnecting: false,
    });
    addLog('system', 'System', 'DISCONNECTED');
    speak('Disconnected');
  }, [connection.method, addLog]);

  const sendCommandSafe = async (command: string, jsonCommand?: object) => {
    if (isDemoMode) return;
    if (!connection.isConnected) return; 

    if (connection.method === 'BLE') {
      await bleService.sendCommand(command);
    } else if (connection.method === 'WIFI') {
      await wifiService.sendCommand(command);
    } else if (connection.method === 'GATEWAY' && jsonCommand) {
      gatewayService.sendCommand(jsonCommand);
    }
  };

  // Device Management
  const addDevice = (newDeviceData: Omit<Device, 'id' | 'isOn' | 'value'>) => {
    const newDevice: Device = {
      ...newDeviceData,
      id: generateId(),
      isOn: false,
      value: 0
    };
    setDevices(prev => [...prev, newDevice]);
    addLog('system', 'System', 'VALUE_CHANGE', `Added device: ${newDevice.name}`);
    speak(`Added ${newDevice.name}`);
  };

  const deleteDevice = (id: string) => {
    const device = devices.find(d => d.id === id);
    if (device) {
      setDevices(prev => prev.filter(d => d.id !== id));
      addLog('system', 'System', 'VALUE_CHANGE', `Removed device: ${device.name}`);
    }
  };

  const toggleDevice = async (deviceId: string, forceState?: boolean) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    const newState = forceState !== undefined ? forceState : !device.isOn;
    if (device.isOn === newState && forceState === undefined) return; 

    const commandStr = newState ? device.onCommand : device.offCommand;
    const jsonCmd = { deviceId: device.id, state: newState, source: 'app' };

    // Optimistic Update
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, isOn: newState } : d))
    );

    try {
      await sendCommandSafe(commandStr, jsonCmd);
      addLog(device.id, device.name, newState ? 'TURNED_ON' : 'TURNED_OFF');
    } catch (error) {
      console.error('Failed to toggle:', error);
      if (!isDemoMode) {
        setDevices((prev) =>
          prev.map((d) => (d.id === deviceId ? { ...d, isOn: !newState } : d))
        );
        addLog(device.id, device.name, 'ERROR', 'Connection failed');
      }
    }
  };

  const setDeviceValue = async (deviceId: string, value: number) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, value } : d))
    );

    const now = Date.now();
    const timeSinceLast = now - lastCommandTimeRef.current;
    
    if (debounceTimerRef.current) {
       clearTimeout(debounceTimerRef.current);
    }

    const send = async () => {
      const prefix = device.onCommand.split(':')[0]; 
      const commandStr = `${prefix}:VAL:${value}`;
      const jsonCmd = { deviceId: device.id, value: value, source: 'app' };
      
      lastCommandTimeRef.current = Date.now();
      try {
        await sendCommandSafe(commandStr, jsonCmd);
      } catch (error) {
        // Silent fail
      }
    };

    if (timeSinceLast > 200) {
       send();
    } else {
       debounceTimerRef.current = setTimeout(send, 200);
    }
  };

  // --- AI & Voice Processing ---

  const sendAiMessage = async (text: string) => {
    const userMsg: ChatMessage = { id: generateId(), sender: 'user', text, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);

    try {
      // Gather full context for the AI
      const aiContext: AiContext = {
        devices,
        logs,
        environment,
        connection,
        user
      };

      const { text: aiResponseText, toolCalls } = await aiService.processCommand(text, aiContext);

      // Execute tools
      for (const call of toolCalls) {
        if (call.name === 'control_device') {
          const { deviceId, action, value } = call.args;
          const device = devices.find(d => d.id === deviceId);
          if (device) {
             if (action === 'ON') await toggleDevice(deviceId, true);
             if (action === 'OFF') await toggleDevice(deviceId, false);
             if (action === 'SET' && value !== undefined) {
               await setDeviceValue(deviceId, Number(value));
               if (!device.isOn) await toggleDevice(deviceId, true);
             }
          }
        } 
        else if (call.name === 'control_all_devices') {
          const { action } = call.args;
          const targetState = action === 'ON';
          const promises = devices.map(d => {
             if (d.isOn !== targetState) return toggleDevice(d.id, targetState);
             return Promise.resolve();
          });
          await Promise.all(promises);
        }
        else if (call.name === 'set_theme') {
          const { mode } = call.args;
          setTheme(mode as 'light' | 'dark');
        }
        else if (call.name === 'set_demo_mode') {
          const { enabled } = call.args;
          setIsDemoMode(Boolean(enabled));
        }
        else if (call.name === 'clear_logs') {
          clearLogs();
        }
      }

      const aiMsg: ChatMessage = { id: generateId(), sender: 'ai', text: aiResponseText, timestamp: Date.now() };
      setChatHistory(prev => [...prev, aiMsg]);
      
      if (isListening) {
        speak(aiResponseText);
      }
      addLog('system', 'AI Assistant', 'AI_RESPONSE', 'Processed command');
    } catch (e) {
      console.error(e);
      // Fallback logic
      const fallbackExecuted = processRegexCommand(text);
      if (fallbackExecuted) {
        const aiMsg: ChatMessage = { id: generateId(), sender: 'ai', text: "I processed that locally.", timestamp: Date.now() };
        setChatHistory(prev => [...prev, aiMsg]);
      } else {
        const aiMsg: ChatMessage = { id: generateId(), sender: 'ai', text: "I'm having trouble connecting to my brain right now.", timestamp: Date.now() };
        setChatHistory(prev => [...prev, aiMsg]);
      }
    }
  };

  const processRegexCommand = (transcript: string): boolean => {
    const lower = transcript.toLowerCase().trim();
    let commandFound = false;

    // Check for global commands in fallback mode
    if (lower.includes('all lights') || lower.includes('everything')) {
        const targetState = lower.includes('on');
        if (targetState || lower.includes('off')) {
           devices.forEach(d => toggleDevice(d.id, targetState));
           speak(targetState ? "Turning everything on" : "Turning everything off");
           return true;
        }
    }

    devices.forEach(d => {
      const dName = d.name.toLowerCase();
      const matchesName = lower.includes(dName) || dName.split(' ').some(part => part.length > 3 && lower.includes(part));
      const matchesType = lower.includes(d.type.toLowerCase());
      
      if (matchesName || matchesType) {
        if (lower.includes('on') || lower.includes('start')) {
          toggleDevice(d.id, true);
          commandFound = true;
          speak(`Turning on ${d.name}`);
        } else if (lower.includes('off') || lower.includes('stop')) {
          toggleDevice(d.id, false);
          commandFound = true;
          speak(`Turning off ${d.name}`);
        } else if ((lower.includes('set') || lower.includes('change')) && (lower.includes('speed') || lower.includes('brightness') || lower.includes('to'))) {
          const match = lower.match(/(\d+)/);
          if (match) {
            let val = parseInt(match[0]);
            if (val > 100) val = 100;
            if (val < 0) val = 0;
            setDeviceValue(d.id, val);
            if (!d.isOn) toggleDevice(d.id, true);
            commandFound = true;
            addLog(d.id, d.name, 'VALUE_CHANGE', `Set to ${val}% via Voice`);
            speak(`Setting ${d.name} to ${val} percent`);
          }
        }
      }
    });
    return commandFound;
  };

  const startVoiceControl = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice control not supported in this browser.");
      return;
    }
    try {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (recognitionRef.current) recognitionRef.current.abort();

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') speak("Microphone access denied");
      };
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        addLog('voice', 'Voice', 'VOICE_COMMAND', transcript);
        sendAiMessage(transcript);
      };
      recognitionRef.current.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const stopVoiceControl = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const clearLogs = () => setLogs([]);

  useEffect(() => {
    if (!isDemoMode) return;
    const interval = setInterval(() => {
      setEnvironment(prev => ({
        temperature: parseFloat((prev.temperature + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        humidity: Math.floor(prev.humidity + (Math.random() * 2 - 1))
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  return (
    <HomeContext.Provider
      value={{
        user,
        userHistory,
        login,
        logout,
        theme,
        toggleTheme,
        devices,
        addDevice,
        deleteDevice,
        toggleDevice,
        setDeviceValue,
        logs,
        connection,
        environment,
        connectBluetooth,
        connectWifi,
        connectGateway,
        disconnect,
        clearLogs,
        isDemoMode,
        setDemoMode: setIsDemoMode,
        isListening,
        startVoiceControl,
        stopVoiceControl,
        isAiOpen,
        toggleAiChat,
        chatHistory,
        sendAiMessage
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export const useHome = () => {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};