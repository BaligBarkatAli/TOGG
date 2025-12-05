import { BLE_SERVICE_UUID, BLE_CHARACTERISTIC_WRITE_UUID, BLE_CHARACTERISTIC_NOTIFY_UUID } from './constants';

// Interface for the BluetoothDevice object
interface BluetoothDevice extends EventTarget {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface BluetoothRemoteGATTServer {
  device: BluetoothDevice;
  connected: boolean;
  connect: () => Promise<BluetoothRemoteGATTServer>;
  disconnect: () => void;
  getPrimaryService: (uuid: string) => Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic: (uuid: string) => Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic {
  writeValue: (value: BufferSource) => Promise<void>;
  startNotifications: () => Promise<BluetoothRemoteGATTCharacteristic>;
  addEventListener: (type: string, listener: (event: any) => void) => void;
  removeEventListener: (type: string, listener: (event: any) => void) => void;
  value?: DataView;
}

type DataCallback = (data: string) => void;
type DisconnectCallback = () => void;

class BLEService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private notifyCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onDataReceived: DataCallback | null = null;
  private onDisconnectCallback: DisconnectCallback | null = null;
  private isWriting: boolean = false;

  /**
   * Request a device and connect to it.
   */
  async connect(onData: DataCallback, onDisconnect: DisconnectCallback): Promise<string> {
    this.onDataReceived = onData;
    this.onDisconnectCallback = onDisconnect;
    
    const nav = navigator as any;
    if (!nav.bluetooth) {
      throw new Error('Web Bluetooth is not supported in this browser.');
    }

    try {
      console.log('Requesting Bluetooth Device...');
      this.device = await nav.bluetooth.requestDevice({
        filters: [{ services: [BLE_SERVICE_UUID] }],
        optionalServices: [BLE_SERVICE_UUID]
      });

      if (!this.device || !this.device.gatt) {
        throw new Error('No device selected');
      }

      // Add listener for unexpected disconnections (e.g. out of range)
      this.device.addEventListener('gattserverdisconnected', this.handleDisconnectEvent);

      console.log('Connecting to GATT Server...');
      this.server = await this.device.gatt.connect();

      console.log('Getting Service...');
      const service = await this.server.getPrimaryService(BLE_SERVICE_UUID);

      console.log('Getting Characteristics...');
      this.writeCharacteristic = await service.getCharacteristic(BLE_CHARACTERISTIC_WRITE_UUID);
      
      // Setup Notifications
      try {
        this.notifyCharacteristic = await service.getCharacteristic(BLE_CHARACTERISTIC_NOTIFY_UUID);
        await this.notifyCharacteristic.startNotifications();
        this.notifyCharacteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);
        console.log('Notifications started');
      } catch (e) {
        console.warn('Could not start notifications (hardware might not support it):', e);
      }

      return this.device.name || 'Unknown Device';
    } catch (error: any) {
      // Only log actual errors, not user cancellations (NotFoundError)
      if (error.name !== 'NotFoundError') {
        console.error('BLE Error:', error);
      }
      
      // Clean up if connection failed partway
      this.disconnect(); 
      throw error;
    }
  }

  handleDisconnectEvent = () => {
    console.log('Device disconnected unexpectedly');
    if (this.onDisconnectCallback) {
      this.onDisconnectCallback();
    }
    this.cleanup();
  };

  handleCharacteristicValueChanged = (event: any) => {
    const value = event.target.value;
    const decoder = new TextDecoder('utf-8');
    const str = decoder.decode(value);
    if (this.onDataReceived) {
      this.onDataReceived(str);
    }
  };

  /**
   * Disconnect from the device manually.
   */
  disconnect() {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.cleanup();
  }

  /**
   * Clean up listeners and references
   */
  private cleanup() {
    if (this.device) {
      this.device.removeEventListener('gattserverdisconnected', this.handleDisconnectEvent);
    }
    if (this.notifyCharacteristic) {
      try {
        this.notifyCharacteristic.removeEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);
      } catch (e) { /* ignore */ }
    }
    
    this.device = null;
    this.server = null;
    this.writeCharacteristic = null;
    this.notifyCharacteristic = null;
    this.isWriting = false;
  }

  /**
   * Send a command string to the device.
   */
  async sendCommand(command: string): Promise<void> {
    if (!this.writeCharacteristic) {
      console.warn('Cannot send command: No write characteristic available.');
      return;
    }

    if (this.isWriting) {
      console.warn('Bluetooth is busy writing, dropping command:', command);
      return;
    }

    try {
      this.isWriting = true;
      const encoder = new TextEncoder();
      const data = encoder.encode(command);
      await this.writeCharacteristic.writeValue(data);
    } catch (error) {
        console.error("Failed to write to device", error);
        throw error;
    } finally {
      this.isWriting = false;
    }
  }

  isConnected(): boolean {
    return !!(this.device && this.device.gatt && this.device.gatt.connected);
  }
}

export const bleService = new BLEService();