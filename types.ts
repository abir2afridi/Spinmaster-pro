
export interface WheelEntry {
  id: string;
  text: string;
  color: string;
  enabled: boolean;
  weight?: number; // Future proofing for weighted probability
}

export interface HistoryEntry {
  id: string;
  text: string;
  timestamp: number;
}

export interface AppSettings {
  spinDuration: number; // seconds
  enableSound: boolean;
  removeWinner: boolean;
  theme: 'light' | 'dark';
  showConfetti: boolean;
  backgroundImage?: string;
  wheelImage?: string;
  rimColor: string;
  winSound: string;
  tickSound: string;
  centerHubColor: string;
  centerHubIcon: string;
  centerHubShape: string;
  centerHubText: string;
  pointerStyle: string;
  pointerColor: string;
  language: string;
}

export interface SavedWheel {
  id: string;
  name: string;
  entries: WheelEntry[]; // Store full objects to persist colors
  lastModified: number;
}

export interface WheelColors {
  scheme: string[];
}