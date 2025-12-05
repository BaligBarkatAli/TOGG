import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { Device, LogEntry, EnvironmentState, ConnectionState, User } from "./types";

export interface AiContext {
  devices: Device[];
  logs: LogEntry[];
  environment: EnvironmentState;
  connection: ConnectionState;
  user: User | null;
}

// 1. Control Single Device
const controlDeviceTool: FunctionDeclaration = {
  name: "control_device",
  description: "Control a specific smart home device. Turn on/off or set values (brightness/speed).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      deviceId: {
        type: Type.STRING,
        description: "The ID of the device. Infer from the provided device list.",
      },
      action: {
        type: Type.STRING,
        enum: ["ON", "OFF", "SET"],
        description: "The action to perform.",
      },
      value: {
        type: Type.NUMBER,
        description: "The value to set (0-100). Required if action is SET.",
      },
    },
    required: ["deviceId", "action"],
  },
};

// 2. Control All Devices (Scene/Group)
const controlAllDevicesTool: FunctionDeclaration = {
  name: "control_all_devices",
  description: "Turn ALL devices on or off simultaneously. Use for 'Goodnight', 'Leaving home', or 'I'm home' scenarios.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ["ON", "OFF"],
        description: "Turn all devices ON or OFF.",
      },
    },
    required: ["action"],
  },
};

// 3. System Settings: Theme
const setThemeTool: FunctionDeclaration = {
  name: "set_theme",
  description: "Change the application theme to Light or Dark mode.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      mode: {
        type: Type.STRING,
        enum: ["light", "dark"],
        description: "The theme mode to apply.",
      },
    },
    required: ["mode"],
  },
};

// 4. System Settings: Demo Mode
const setDemoModeTool: FunctionDeclaration = {
  name: "set_demo_mode",
  description: "Enable or Disable the Demo/Simulation mode.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      enabled: {
        type: Type.BOOLEAN,
        description: "True to enable demo mode, False to disable.",
      },
    },
    required: ["enabled"],
  },
};

// 5. System: Logs
const clearLogsTool: FunctionDeclaration = {
  name: "clear_logs",
  description: "Clear the application activity logs.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

class AiService {
  private ai: GoogleGenAI | null = null;
  private modelName = "gemini-2.5-flash";

  constructor() {
    if (process.env.API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }

  /**
   * Process a natural language command with advanced system control.
   */
  async processCommand(prompt: string, context: AiContext): Promise<{ text: string; toolCalls: any[] }> {
    if (!this.ai) {
      return { text: "I need an API Key to become smart!", toolCalls: [] };
    }

    // Context Formatting
    const deviceContext = context.devices.map(d => 
      `[${d.id}] ${d.name} (${d.type}): ${d.isOn ? 'ON' : 'OFF'} ${d.value > 0 ? `(Value: ${d.value})` : ''} - Room: ${d.roomId}`
    ).join('\n');

    const logContext = context.logs.slice(0, 5).map(l => 
      `- ${l.action}: ${l.deviceName} (${l.details || ''})`
    ).join('\n');

    const systemInstruction = `You are TOGG Assistant, the advanced AI core of this smart home.
    You have ADMIN-LEVEL control over devices, system settings, and data.

    === CURRENT HOME STATE ===
    User: ${context.user?.username || 'Guest'}
    Environment: ${context.environment.temperature}°C, ${context.environment.humidity}% Humidity
    Connection: ${context.connection.isConnected ? `Online (${context.connection.method})` : 'Offline'}
    Theme: ${typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'}
    
    === DEVICES ===
    ${deviceContext}

    === RECENT LOGS ===
    ${logContext}

    === YOUR CAPABILITIES ===
    1. Control specific devices (Turn on Kitchen Light, Set Fan to 50%).
    2. Control ALL devices at once (Turn everything off, Goodnight mode).
    3. Change App Theme (Switch to dark mode, make it bright).
    4. Manage System (Enable/Disable Demo Mode, Clear Logs).
    5. Answer questions based on the state.

    Rules:
    - If the user implies a scene like "I'm going to bed", turn OFF all devices.
    - If the user wants to change the UI look, use 'set_theme'.
    - Be concise and helpful.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ 
            functionDeclarations: [
              controlDeviceTool, 
              controlAllDevicesTool, 
              setThemeTool, 
              setDemoModeTool, 
              clearLogsTool
            ] 
          }],
        }
      });

      const toolCalls: any[] = [];
      let responseText = "";

      if (response.functionCalls) {
        response.functionCalls.forEach(fc => toolCalls.push(fc));
        // Provide a default acknowledgment if the model didn't generate text but generated a tool call
        responseText = response.text || (toolCalls.length > 0 ? "On it." : "I didn't understand.");
      } else {
        responseText = response.text || "I'm not sure how to handle that.";
      }

      return { text: responseText, toolCalls };

    } catch (error) {
      console.error("AI Error:", error);
      return { text: "My brain connection is a bit fuzzy right now.", toolCalls: [] };
    }
  }
}

export const aiService = new AiService();