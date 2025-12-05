/**
 * Service to handle WiFi interactions.
 * In a real application, this would fetch from an ESP32 web server or a cloud backend.
 */
class WifiService {
  private ip: string | null = null;

  /**
   * Connect to a device via IP.
   */
  async connect(ip: string): Promise<string> {
    this.ip = ip;
    console.log(`Connecting to WiFi Device at ${ip}...`);
    
    // Simulate network delay and handshake
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Basic validation simulation
    const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipPattern.test(ip) && ip !== 'localhost') {
       throw new Error('Invalid IP Address format.');
    }

    return ip;
  }

  /**
   * Disconnect.
   */
  disconnect() {
    this.ip = null;
  }

  /**
   * Send a command string to the device via HTTP/WebSocket.
   */
  async sendCommand(command: string): Promise<void> {
    if (!this.ip) {
      throw new Error("No WiFi connection established");
    }

    console.log(`[WiFi] Sending to http://${this.ip}/api: ${command}`);
    
    // Simulate network request
    // In real scenario: await fetch(`http://${this.ip}/command?q=${command}`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

export const wifiService = new WifiService();