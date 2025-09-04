import { ApiResponse, ApiField, ApiCacheEntry } from '@/types';

class ApiService {
  private cache = new Map<string, ApiCacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  async fetchData(url: string, options?: RequestInit): Promise<ApiResponse> {
    console.log('🔍 Fetching data from:', url);
    const cacheKey = this.getCacheKey(url, options);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log('📦 Using cached data for:', url);
      return {
        data: cached.data,
        fields: this.parseApiFields(cached.data),
        success: true
      };
    }

         // Handle mock URLs for testing
     if (url.startsWith('mock://')) {
       console.log('🎭 Using mock data for:', url);
       const mockData = this.getMockData(url);
       console.log('📊 Mock data:', mockData);
       return {
         data: mockData,
         fields: this.parseApiFields(mockData),
         success: true
       };
     }

    // Handle CORS proxy for APIs that don't support CORS
    let requestUrl = url;
    if (url.includes('alphavantage.co') || url.includes('finnhub.io') || url.includes('api.stlouisfed.org')) {
      // Use a CORS proxy for APIs that don't support CORS
      requestUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    }

    try {
      const response = await this.makeRequest(requestUrl, options);
      const data = await response.json();
      
      // Cache the response using original URL
      const originalCacheKey = this.getCacheKey(url, options);
      this.cache.set(originalCacheKey, {
        data,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      });

      return {
        data,
        fields: this.parseApiFields(data),
        success: true
      };
    } catch (error) {
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
          errorMessage = 'CORS error: This API doesn\'t allow cross-origin requests. Try using a CORS proxy or a different API.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the API. Check your internet connection and API URL.';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'API endpoint not found. Please check the URL.';
        } else if (error.message.includes('HTTP 401') || error.message.includes('HTTP 403')) {
          errorMessage = 'Authentication error: Invalid API key or insufficient permissions.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        data: null,
        fields: [],
        success: false,
        error: errorMessage
      };
    }
  }

  private async makeRequest(url: string, options?: RequestInit, retryCount = 0): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 429 && retryCount < this.MAX_RETRIES) {
          // Rate limited, wait and retry
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.RETRY_DELAY * Math.pow(2, retryCount);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(url, options, retryCount + 1);
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (retryCount < this.MAX_RETRIES && this.isRetryableError(error)) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, retryCount)));
        return this.makeRequest(url, options, retryCount + 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    return (
      error.name === 'TypeError' || // Network error
      error.message.includes('fetch') ||
      error.message.includes('network')
    );
  }

  private getCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  private parseApiFields(data: any, prefix = ''): ApiField[] {
    const fields: ApiField[] = [];
    
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

  testApiConnection(url: string): Promise<{ success: boolean; message: string; fields?: ApiField[] }> {
    return new Promise(async (resolve) => {
      try {
        const response = await this.fetchData(url);
        
        if (response.success) {
          resolve({
            success: true,
            message: `API connection successful! ${response.fields.length} fields found.`,
            fields: response.fields
          });
        } else {
          resolve({
            success: false,
            message: response.error || 'Failed to connect to API'
          });
        }
      } catch (error) {
        resolve({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  private getMockData(url: string): any {
    switch (url) {
      case 'mock://bitcoin':
        return {
          currency: 'BTC',
          rates: {
            USD: '45000.00',
            EUR: '38000.00',
            GBP: '32000.00',
            JPY: '5000000.00'
          }
        };
      case 'mock://stock':
        return [
          {
            symbol: 'AAPL',
            price: 150.25,
            change: 2.50,
            changePercent: 1.69,
            volume: 45000000,
            marketCap: 2500000000000
          },
          {
            symbol: 'GOOGL',
            price: 2750.80,
            change: -15.20,
            changePercent: -0.55,
            volume: 28000000,
            marketCap: 1850000000000
          },
          {
            symbol: 'MSFT',
            price: 310.45,
            change: 8.75,
            changePercent: 2.90,
            volume: 35000000,
            marketCap: 2300000000000
          },
          {
            symbol: 'TSLA',
            price: 850.30,
            change: 25.80,
            changePercent: 3.13,
            volume: 55000000,
            marketCap: 850000000000
          },
          {
            symbol: 'AMZN',
            price: 3400.15,
            change: -45.25,
            changePercent: -1.31,
            volume: 32000000,
            marketCap: 1700000000000
          }
        ];
      case 'mock://forex':
        return {
          base: 'USD',
          date: new Date().toISOString().split('T')[0],
          rates: {
            EUR: 0.85,
            GBP: 0.73,
            JPY: 110.50,
            CAD: 1.25
          }
        };
      case 'mock://alphavantage':
        return {
          'Global Quote': {
            '01. symbol': 'IBM',
            '02. open': '150.00',
            '03. high': '152.50',
            '04. low': '149.50',
            '05. price': '151.25',
            '06. volume': '2500000',
            '07. latest trading day': new Date().toISOString().split('T')[0],
            '08. previous close': '149.75',
            '09. change': '+1.50',
            '10. change percent': '+1.00%'
          }
        };
      case 'mock://crypto':
        return [
          { symbol: 'BTC', price: 45000, change24h: 2.5, marketCap: 850000000000 },
          { symbol: 'ETH', price: 3200, change24h: -1.2, marketCap: 385000000000 },
          { symbol: 'BNB', price: 320, change24h: 0.8, marketCap: 50000000000 },
          { symbol: 'ADA', price: 0.45, change24h: 3.2, marketCap: 15000000000 },
          { symbol: 'SOL', price: 95, change24h: -2.1, marketCap: 40000000000 }
        ];
      case 'mock://portfolio':
        return {
          totalValue: 125000,
          dayChange: 2500,
          dayChangePercent: 2.04,
          totalGain: 15000,
          totalGainPercent: 13.64
        };
      case 'mock://forex-pairs':
        return [
          { pair: 'EUR/USD', rate: 1.0850, change: 0.0025, changePercent: 0.23 },
          { pair: 'GBP/USD', rate: 1.2650, change: -0.0015, changePercent: -0.12 },
          { pair: 'USD/JPY', rate: 149.25, change: 0.35, changePercent: 0.24 },
          { pair: 'AUD/USD', rate: 0.6520, change: 0.0010, changePercent: 0.15 },
          { pair: 'USD/CAD', rate: 1.3580, change: -0.0020, changePercent: -0.15 }
        ];
      case 'mock://market-summary':
        return {
          totalMarketCap: 2500000000000,
          activeCurrencies: 8500,
          marketChange24h: 1.8,
          bitcoinDominance: 42.5,
          fearGreedIndex: 65
        };
      case 'mock://gainers':
        return [
          { symbol: 'DOGE', price: 0.085, change: 0.012, changePercent: 16.44 },
          { symbol: 'SHIB', price: 0.0000085, change: 0.0000012, changePercent: 16.44 },
          { symbol: 'PEPE', price: 0.0000012, change: 0.0000002, changePercent: 20.0 },
          { symbol: 'FLOKI', price: 0.00015, change: 0.00002, changePercent: 15.38 },
          { symbol: 'BONK', price: 0.000025, change: 0.000003, changePercent: 13.64 }
        ];
      case 'mock://market-trends':
        return [
          { cryptoIndex: 85.2, stockIndex: 78.5, forexIndex: 72.1 },
          { cryptoIndex: 87.1, stockIndex: 79.2, forexIndex: 73.8 },
          { cryptoIndex: 89.5, stockIndex: 81.0, forexIndex: 75.2 },
          { cryptoIndex: 91.2, stockIndex: 82.5, forexIndex: 76.8 },
          { cryptoIndex: 88.7, stockIndex: 80.1, forexIndex: 74.5 }
        ];
      default:
        return {
          message: 'Test data',
          timestamp: new Date().toISOString(),
          value: Math.random() * 100,
          status: 'success'
        };
    }
  }
}

export const apiService = new ApiService();
