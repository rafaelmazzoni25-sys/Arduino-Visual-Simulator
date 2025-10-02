export type ComponentType =
  | 'led'
  | 'button'
  | 'potentiometer'
  | 'resistor'
  | 'servo'
  | 'protoboard'
  | 'buzzer'
  | 'seven_segment_display';

export interface ArduinoComponent {
  id: string;
  type: ComponentType;
  pin: number; // Main associated pin, can be a fallback
  label: string;
  value?: number | Record<string, boolean>; // for potentiometers, servos, or segment displays
  isOn?: boolean; // for LEDs
  isPressed?: boolean; // for buttons
  x?: number; // X position on the breadboard
  y?: number; // Y position on the breadboard
}

export interface SerialLog {
  timestamp: number;
  message: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Terminal {
  componentId: string;
  terminalId: string; // e.g., 'pin-13', 'led-1-anode'
}

export interface Wire {
  id:string;
  start: Terminal;
  end: Terminal;
}
