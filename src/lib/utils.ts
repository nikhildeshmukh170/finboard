import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export function parseApiFields(data: any, prefix = ''): Array<{ path: string; type: string; sampleValue: any; isArray: boolean }> {
  const fields: Array<{ path: string; type: string; sampleValue: any; isArray: boolean }> = [];
  
  function traverse(obj: any, currentPath: string) {
    if (obj === null || obj === undefined) return;
    
    if (Array.isArray(obj)) {
      fields.push({
        path: currentPath,
        type: 'array',
        sampleValue: obj.slice(0, 3),
        isArray: true
      });
      
      if (obj.length > 0) {
        traverse(obj[0], `${currentPath}[0]`);
      }
    } else if (typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        traverse(obj[key], newPath);
      });
    } else {
      fields.push({
        path: currentPath,
        type: typeof obj,
        sampleValue: obj,
        isArray: false
      });
    }
  }
  
  traverse(data, prefix);
  return fields;
}

export function formatLastUpdated(lastUpdated: Date | string | undefined): string {
  if (!lastUpdated) return '';
  
  try {
    const date = lastUpdated instanceof Date ? lastUpdated : new Date(lastUpdated);
    return date.toLocaleTimeString();
  } catch {
    return 'Invalid date';
  }
}
