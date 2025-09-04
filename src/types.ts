// src/types.ts

export interface WidgetField {
  label: string;
  path: string;
  type: "string" | "number" | "array" | "boolean" | "object";
  format?: "currency" | "percentage" | "date";
}

export interface FieldMapping {
    path: string;
    label: string;
  source: string;
  target: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  format?: "currency" | "percentage" | "date" | "number";
}

export interface ApiField {
  path: string;
  label: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  format?: "currency" | "percentage" | "date" | "number";
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
  refreshInterval: number; // in seconds
  selectedFields?: WidgetField[];
  displayMode?: "chart" | "table" | "card";
  config?: Record<string, unknown>;
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
