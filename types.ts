
export enum DeviceType {
  LIGHT = 'LIGHT',
  FAN = 'FAN',
  SWITCH = 'SWITCH',
  AC = 'AC',
  SENSOR = 'SENSOR'
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  isOn: boolean;
  value: number; // 0-100 for brightness or speed
  roomId: string;
  // For BLE/WiFi commands
  onCommand: string;
  offCommand: string;
}

export interface LogEntry {
  id: string;
  deviceId: string;
  deviceName: string;
  action: 'TURNED_ON' | 'TURNED_OFF' | 'VALUE_CHANGE' | 'ERROR' | 'CONNECTED' | 'DISCONNECTED' | 'VOICE_COMMAND' | 'LOGIN' | 'LOGOUT' | 'AI_RESPONSE' | 'PHYSICAL_SWITCH';
  timestamp: number;
  details?: string;
}

export type ConnectionMethod = 'BLE' | 'WIFI' | 'GATEWAY';

export interface ConnectionState {
  isConnected: boolean;
  method: ConnectionMethod | null;
  details: string | null; // Device Name or IP Address
  error: string | null;
  isConnecting: boolean;
}

export interface EnvironmentState {
  temperature: number;
  humidity: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  lastLogin: number;
  role: 'admin' | 'user';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface GatewayMessage {
  deviceId: string;
  state?: boolean;
  value?: number;
  source: 'arduino' | 'app';
}
