import { Widget, LayoutConfig } from '@/types';

export interface DashboardConfig {
  widgets: Widget[];
  layout: LayoutConfig;
  theme: 'light' | 'dark';
  version: string;
  exportedAt: string;
}

export const exportDashboard = (widgets: Widget[], layout: LayoutConfig, theme: 'light' | 'dark'): string => {
  const config: DashboardConfig = {
    widgets,
    layout,
    theme,
    version: '1.0.0',
    exportedAt: new Date().toISOString()
  };

  return JSON.stringify(config, null, 2);
};

export const importDashboard = (jsonString: string): DashboardConfig | null => {
  try {
    const config = JSON.parse(jsonString) as DashboardConfig;
    
    // Validate the structure
    if (!config.widgets || !Array.isArray(config.widgets)) {
      throw new Error('Invalid dashboard configuration: missing or invalid widgets');
    }
    
    if (!config.layout || typeof config.layout !== 'object') {
      throw new Error('Invalid dashboard configuration: missing or invalid layout');
    }
    
    if (!config.theme || !['light', 'dark'].includes(config.theme)) {
      throw new Error('Invalid dashboard configuration: missing or invalid theme');
    }
    
    return config;
  } catch (error) {
    console.error('Failed to import dashboard:', error);
    return null;
  }
};

export const downloadDashboard = (config: string, filename: string = 'finboard-dashboard.json'): void => {
  const blob = new Blob([config], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const uploadDashboard = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };
    input.click();
  });
};
