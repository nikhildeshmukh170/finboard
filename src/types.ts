// src/types.ts
export interface WidgetField {
  label: string;
  path: string;
  type: "string" | "number" | "array" | "boolean" | "object";
}

export interface Widget {
  id: string;
  name: string;
  apiUrl?: string;
  config: {
    chartType: "line" | "bar";
    [key: string]: any;
  };
  data: Record<string, unknown> | null;
  selectedFields: WidgetField[];
  refreshInterval: number;
  lastUpdated?: string | number | Date;
  isLoading?: boolean;
  error?: string | null;
}