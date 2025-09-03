// Test API service for development
export const testApiService = {
  // Mock API responses for testing
  getMockData: (type: string) => {
    switch (type) {
      case 'bitcoin':
        return {
          data: {
            currency: 'BTC',
            rates: {
              USD: '45000.00',
              EUR: '38000.00',
              GBP: '32000.00'
            }
          }
        };
      case 'stock':
        return {
          data: {
            symbol: 'AAPL',
            price: '150.25',
            change: '+2.50',
            changePercent: '+1.69%'
          }
        };
      case 'forex':
        return {
          data: {
            base: 'USD',
            date: new Date().toISOString().split('T')[0],
            rates: {
              EUR: '0.85',
              GBP: '0.73',
              JPY: '110.50'
            }
          }
        };
      default:
        return {
          data: {
            message: 'Test data',
            timestamp: new Date().toISOString(),
            value: Math.random() * 100
          }
        };
    }
  },

  // Test API endpoints that work without CORS issues
  getTestEndpoints: () => [
    {
      name: 'Bitcoin Price (Mock)',
      url: 'mock://bitcoin',
      type: 'bitcoin'
    },
    {
      name: 'Stock Price (Mock)',
      url: 'mock://stock',
      type: 'stock'
    },
    {
      name: 'Forex Rates (Mock)',
      url: 'mock://forex',
      type: 'forex'
    }
  ]
};
