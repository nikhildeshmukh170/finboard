import { Widget } from '@/types';

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'crypto' | 'stocks' | 'forex' | 'mixed';
  widgets: Omit<Widget, 'id' | 'lastUpdated' | 'isLoading' | 'error'>[];
  preview: string;
}

export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'crypto-tracker',
    name: 'Crypto Tracker',
    description: 'Track major cryptocurrencies with real-time prices and market data',
    category: 'crypto',
    preview: 'Bitcoin, Ethereum, and other major crypto prices with charts',
    widgets: [
      {
        name: 'Bitcoin Price',
        type: 'card',
        apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
        refreshInterval: 30,
        selectedFields: [
          { path: 'data.currency', label: 'Currency', type: 'string' },
          { path: 'data.rates.USD', label: 'USD Price', type: 'string', format: 'currency' },
          { path: 'data.rates.EUR', label: 'EUR Price', type: 'string', format: 'currency' }
        ],
        displayMode: 'card',
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
        config: {}
      },
      {
        name: 'Crypto Market Overview',
        type: 'table',
        apiUrl: 'mock://crypto',
        refreshInterval: 60,
        selectedFields: [
          { path: 'symbol', label: 'Symbol', type: 'string' },
          { path: 'price', label: 'Price', type: 'number', format: 'currency' },
          { path: 'change24h', label: '24h Change', type: 'number', format: 'percentage' },
          { path: 'marketCap', label: 'Market Cap', type: 'number', format: 'currency' }
        ],
        displayMode: 'table',
        position: { x: 0, y: 0 },
        size: { width: 500, height: 400 },
        config: {
          searchEnabled: true,
          paginationEnabled: true,
          itemsPerPage: 10
        }
      },
      {
        name: 'Crypto Price Chart',
        type: 'chart',
        apiUrl: 'mock://crypto',
        refreshInterval: 120,
        selectedFields: [
          { path: 'price', label: 'Price', type: 'number' },
          { path: 'change24h', label: '24h Change', type: 'number' }
        ],
        displayMode: 'chart',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        config: {
          chartType: 'line'
        }
      }
    ]
  },
  {
    id: 'stock-portfolio',
    name: 'Stock Portfolio',
    description: 'Monitor your stock portfolio with real-time prices and performance metrics',
    category: 'stocks',
    preview: 'Stock prices, portfolio performance, and market trends',
    widgets: [
      {
        name: 'Portfolio Summary',
        type: 'card',
        apiUrl: 'mock://portfolio',
        refreshInterval: 30,
        selectedFields: [
          { path: 'totalValue', label: 'Total Value', type: 'number', format: 'currency' },
          { path: 'dayChange', label: 'Day Change', type: 'number', format: 'currency' },
          { path: 'dayChangePercent', label: 'Day Change %', type: 'number', format: 'percentage' }
        ],
        displayMode: 'card',
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
        config: {}
      },
      {
        name: 'Stock Holdings',
        type: 'table',
        apiUrl: 'mock://stocks',
        refreshInterval: 60,
        selectedFields: [
          { path: 'symbol', label: 'Symbol', type: 'string' },
          { path: 'price', label: 'Price', type: 'number', format: 'currency' },
          { path: 'change', label: 'Change', type: 'number', format: 'currency' },
          { path: 'changePercent', label: 'Change %', type: 'number', format: 'percentage' },
          { path: 'volume', label: 'Volume', type: 'number' }
        ],
        displayMode: 'table',
        position: { x: 0, y: 0 },
        size: { width: 600, height: 400 },
        config: {
          searchEnabled: true,
          paginationEnabled: true,
          itemsPerPage: 15
        }
      },
      {
        name: 'Stock Performance Chart',
        type: 'chart',
        apiUrl: 'mock://stocks',
        refreshInterval: 120,
        selectedFields: [
          { path: 'price', label: 'Price', type: 'number' },
          { path: 'change', label: 'Change', type: 'number' },
          { path: 'changePercent', label: 'Change %', type: 'number' }
        ],
        displayMode: 'chart',
        position: { x: 0, y: 0 },
        size: { width: 500, height: 350 },
        config: {
          chartType: 'line'
        }
      }
    ]
  },
  {
    id: 'forex-monitor',
    name: 'Forex Monitor',
    description: 'Track major currency pairs and exchange rates',
    category: 'forex',
    preview: 'Major currency pairs with real-time exchange rates',
    widgets: [
      {
        name: 'USD Exchange Rates',
        type: 'card',
        apiUrl: 'mock://forex',
        refreshInterval: 30,
        selectedFields: [
          { path: 'base', label: 'Base Currency', type: 'string' },
          { path: 'rates.EUR', label: 'EUR Rate', type: 'number' },
          { path: 'rates.GBP', label: 'GBP Rate', type: 'number' },
          { path: 'rates.JPY', label: 'JPY Rate', type: 'number' }
        ],
        displayMode: 'card',
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
        config: {}
      },
      {
        name: 'Currency Pairs',
        type: 'table',
        apiUrl: 'mock://forex-pairs',
        refreshInterval: 60,
        selectedFields: [
          { path: 'pair', label: 'Pair', type: 'string' },
          { path: 'rate', label: 'Rate', type: 'number' },
          { path: 'change', label: 'Change', type: 'number' },
          { path: 'changePercent', label: 'Change %', type: 'number', format: 'percentage' }
        ],
        displayMode: 'table',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        config: {
          searchEnabled: true,
          paginationEnabled: true,
          itemsPerPage: 10
        }
      },
      {
        name: 'Forex Trends',
        type: 'chart',
        apiUrl: 'mock://forex',
        refreshInterval: 120,
        selectedFields: [
          { path: 'rates.EUR', label: 'EUR Rate', type: 'number' },
          { path: 'rates.GBP', label: 'GBP Rate', type: 'number' },
          { path: 'rates.JPY', label: 'JPY Rate', type: 'number' }
        ],
        displayMode: 'chart',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        config: {
          chartType: 'line'
        }
      }
    ]
  },
  {
    id: 'market-overview',
    name: 'Market Overview',
    description: 'Comprehensive view of crypto, stocks, and forex markets',
    category: 'mixed',
    preview: 'Multi-asset dashboard with crypto, stocks, and forex data',
    widgets: [
      {
        name: 'Market Summary',
        type: 'card',
        apiUrl: 'mock://market-summary',
        refreshInterval: 30,
        selectedFields: [
          { path: 'totalMarketCap', label: 'Total Market Cap', type: 'number', format: 'currency' },
          { path: 'activeCurrencies', label: 'Active Currencies', type: 'number' },
          { path: 'marketChange24h', label: '24h Change', type: 'number', format: 'percentage' }
        ],
        displayMode: 'card',
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
        config: {}
      },
      {
        name: 'Top Gainers',
        type: 'table',
        apiUrl: 'mock://gainers',
        refreshInterval: 60,
        selectedFields: [
          { path: 'symbol', label: 'Symbol', type: 'string' },
          { path: 'price', label: 'Price', type: 'number', format: 'currency' },
          { path: 'change', label: 'Change', type: 'number', format: 'currency' },
          { path: 'changePercent', label: 'Change %', type: 'number', format: 'percentage' }
        ],
        displayMode: 'table',
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        config: {
          searchEnabled: true,
          paginationEnabled: true,
          itemsPerPage: 10
        }
      },
      {
        name: 'Market Trends',
        type: 'chart',
        apiUrl: 'mock://market-trends',
        refreshInterval: 120,
        selectedFields: [
          { path: 'cryptoIndex', label: 'Crypto Index', type: 'number' },
          { path: 'stockIndex', label: 'Stock Index', type: 'number' },
          { path: 'forexIndex', label: 'Forex Index', type: 'number' }
        ],
        displayMode: 'chart',
        position: { x: 0, y: 0 },
        size: { width: 500, height: 350 },
        config: {
          chartType: 'line'
        }
      }
    ]
  }
];

export const getTemplateById = (id: string): DashboardTemplate | undefined => {
  return dashboardTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): DashboardTemplate[] => {
  return dashboardTemplates.filter(template => template.category === category);
};
