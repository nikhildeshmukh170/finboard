// src/types.ts
export interface WidgetField {
  label: string;
  path: string;
  type: "string" | "number" | "array" | "boolean" | "object";
}

export interface Widget {
  id: string;
  name: string;
  apiUrl: string;
  type: "chart" | "table" | "stat" | "card";
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  data?: unknown;
  lastUpdated: Date;
  isLoading: boolean;
  error?: string;

  refreshInterval: number;
}


export interface LayoutConfig {
  columns: number;
  gap: number;
  padding: number;
}

export interface DashboardState {
  widgets: Widget[];
  layout: LayoutConfig;
  theme: "light" | "dark";
  isLoading: boolean;
  error?: string;
}