export interface Widget {
  id: string;
  name: string;
  type: WidgetType;
  apiUrl: string;
  refreshInterval: number;
  selectedFields: FieldMapping[];
  displayMode: DisplayMode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: WidgetConfig;
  data?: any;
  lastUpdated?: Date;
  isLoading?: boolean;
  error?: string;
}

export type WidgetType = 'card' | 'table' | 'chart';

export type DisplayMode = 'card' | 'table' | 'chart';

export interface FieldMapping {
  path: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  format?: 'currency' | 'percentage' | 'number' | 'date';
}

export interface WidgetConfig {
  showArraysOnly?: boolean;
  searchEnabled?: boolean;
  paginationEnabled?: boolean;
  itemsPerPage?: number;
  chartType?: 'line' | 'bar' | 'candlestick';
  timeInterval?: '1min' | '5min' | '15min' | '30min' | '1hour' | '1day';
}

export interface ApiResponse {
  data: any;
  fields: ApiField[];
  success: boolean;
  error?: string;
}

export interface ApiField {
  path: string;
  type: string;
  sampleValue: any;
  isArray: boolean;
}

export interface DashboardState {
  widgets: Widget[];
  layout: LayoutConfig;
  theme: 'light' | 'dark';
  isLoading: boolean;
  error?: string;
}

export interface LayoutConfig {
  columns: number;
  gap: number;
  padding: number;
}

export interface ApiCacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  retryAfter?: number;
}
