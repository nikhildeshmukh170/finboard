# API Examples for FinBoard

This document provides examples of popular financial APIs that work well with FinBoard.

## Cryptocurrency APIs

### Coinbase API
**URL**: `https://api.coinbase.com/v2/exchange-rates?currency=BTC`
**Description**: Get Bitcoin exchange rates
**Fields**: `data.currency`, `data.rates.USD`, `data.rates.EUR`

### CoinGecko API
**URL**: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur`
**Description**: Get cryptocurrency prices
**Fields**: `bitcoin.usd`, `bitcoin.eur`

## Stock Market APIs

### Alpha Vantage
**URL**: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=YOUR_API_KEY`
**Description**: Get real-time stock quotes
**Fields**: `Global Quote.01. symbol`, `Global Quote.05. price`, `Global Quote.09. change`

### Finnhub
**URL**: `https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY`
**Description**: Get stock quotes
**Fields**: `c` (current price), `d` (change), `dp` (percent change)

## Economic Data APIs

### FRED (Federal Reserve Economic Data)
**URL**: `https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=YOUR_API_KEY&file_type=json`
**Description**: Get economic indicators
**Fields**: `observations[].date`, `observations[].value`

## Forex APIs

### ExchangeRate-API
**URL**: `https://api.exchangerate-api.com/v4/latest/USD`
**Description**: Get currency exchange rates
**Fields**: `base`, `date`, `rates.USD`, `rates.EUR`

## Getting API Keys

### Alpha Vantage
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Get your API key from the dashboard

### Finnhub
1. Visit [Finnhub](https://finnhub.io/)
2. Sign up for a free account
3. Get your API key from the dashboard

### FRED
1. Visit [FRED API](https://fred.stlouisfed.org/docs/api/api_key.html)
2. Sign up for a free account
3. Get your API key from the dashboard

## Tips for API Integration

1. **Test First**: Always use the "Test" button in FinBoard to validate your API before creating a widget
2. **Check Rate Limits**: Be aware of API rate limits and set appropriate refresh intervals
3. **Handle Errors**: Some APIs may return errors - FinBoard will display these gracefully
4. **CORS Issues**: If you encounter CORS issues, you may need to use a proxy or the API provider's CORS-enabled endpoint

## Example Widget Configurations

### Bitcoin Price Tracker
- **Name**: Bitcoin Price Tracker
- **API**: `https://api.coinbase.com/v2/exchange-rates?currency=BTC`
- **Fields**: `data.currency`, `data.rates.USD`
- **Type**: Card
- **Refresh**: 30 seconds

### Stock Portfolio
- **Name**: AAPL Stock
- **API**: `https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY`
- **Fields**: `c`, `d`, `dp`
- **Type**: Card
- **Refresh**: 60 seconds

### Market Data Table
- **Name**: Top Stocks
- **API**: `https://api.example.com/stocks`
- **Fields**: `symbol`, `price`, `change`
- **Type**: Table
- **Refresh**: 120 seconds
