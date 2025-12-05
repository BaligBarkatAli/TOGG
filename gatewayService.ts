import { Device } from './types';

type MessageCallback = (data: any) => void;
type DisconnectCallback = () => void;

class GatewayService {
  private socket: WebSocket | null = null;
  private url: string | null = null;
  private simulationInterval: any = null;
  private onMessage: MessageCallback | null = null;
  private onDisconnect: DisconnectCallback | null = null;

  /**
   * Connect to a WebSocket Gateway.
   * If url is 'demo', it starts a simulation.
   */
  async connect(url: string, onMessage: MessageCallback, onDisconnect: DisconnectCallback): Promise<string> {
    this.url = url;
    this.onMessage = onMessage;
    this.onDisconnect = onDisconnect;

    console.log(`[Gateway] Connecting to ${url}...`);

    if (url === 'demo') {
      this.startSimulation();
      return 'Demo Gateway';
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          console.log('[Gateway] Connected');
          resolve(url);
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (this.onMessage) this.onMessage(data);
          } catch (e) {
            console.warn('[Gateway] Received non-JSON message:', event.data);
          }
        };

        this.socket.onclose = () => {
          console.log('[Gateway] Closed');
          if (this.onDisconnect) this.onDisconnect();
        };

        this.socket.onerror = (err) => {
          console.error('[Gateway] Error', err);
          reject(new Error('WebSocket connection failed'));
        };

      } catch (e) {
        reject(e);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  sendCommand(command: object) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(command));
    } else if (this.url === 'demo') {
      console.log('[Gateway Simulation] Sent:', command);
    } else {
      console.warn('[Gateway] Cannot send, socket not open');
    }
  }

  // --- Simulation Logic for Demo Mode ---
  
  private startSimulation() {
    console.log('[Gateway] Starting Arduino Simulation...');
    
    // Simulate an Arduino sending a "Physical Switch" event every 8 seconds
    this.simulationInterval = setInterval(() => {
      if (this.onMessage) {
        // Randomly pick a device ID from 1 to 4
        const randomId = Math.floor(Math.random() * 4) + 1;
        const randomState = Math.random() > 0.5;
        
        const simulatedPayload = {
          deviceId: String(randomId),
          state: randomState,
          source: 'arduino'
        };

        console.log('[Gateway Simulation] Incoming Arduino Message:', simulatedPayload);
        this.onMessage(simulatedPayload);
      }
    }, 8000);
  }
}

export const gatewayService = new GatewayService();