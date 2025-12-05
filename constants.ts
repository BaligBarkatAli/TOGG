import { Device, DeviceType } from './types';

// Generic UUIDs often used in ESP32/Arduino BLE UART examples (Nordic UART Service)
export const BLE_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const BLE_CHARACTERISTIC_WRITE_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
export const BLE_CHARACTERISTIC_NOTIFY_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

export const INITIAL_DEVICES: Device[] = [
  {
    id: '1',
    name: 'Living Room Light',
    type: DeviceType.LIGHT,
    isOn: false,
    value: 80,
    roomId: 'living-room',
    onCommand: 'L1:ON',
    offCommand: 'L1:OFF'
  },
  {
    id: '2',
    name: 'Ceiling Fan',
    type: DeviceType.FAN,
    isOn: false,
    value: 30,
    roomId: 'living-room',
    onCommand: 'F1:ON',
    offCommand: 'F1:OFF'
  },
  {
    id: '3',
    name: 'Kitchen Strip',
    type: DeviceType.LIGHT,
    isOn: false,
    value: 100,
    roomId: 'kitchen',
    onCommand: 'L2:ON',
    offCommand: 'L2:OFF'
  },
  {
    id: '4',
    name: 'Master AC',
    type: DeviceType.AC,
    isOn: false,
    value: 24, // Represents temp setting
    roomId: 'bedroom',
    onCommand: 'A1:ON',
    offCommand: 'A1:OFF'
  }
];