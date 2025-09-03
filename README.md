# FinBoard - Finance Dashboard

A customizable finance dashboard built with Next.js that allows users to connect to various financial APIs and display real-time data through customizable widgets.

## Features

### 🎯 Core Features
- **Widget Management System**: Add, remove, and configure finance data widgets
- **API Integration**: Connect to any financial API with dynamic data mapping
- **Real-time Updates**: Automatic data refresh with configurable intervals
- **Drag & Drop**: Reorganize widgets with intuitive drag-and-drop functionality
- **Data Persistence**: All configurations persist across browser sessions

### 📊 Widget Types
- **Card Widgets**: Display key metrics in a clean card format
- **Table Widgets**: Show data in paginated tables with search functionality
- **Chart Widgets**: Visualize data with line and bar charts

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes seamlessly
- **Responsive Design**: Works on all screen sizes
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Smooth loading indicators throughout the app

### 🔧 Technical Features
- **State Management**: Zustand for efficient state management
- **Data Caching**: Intelligent API response caching
- **Rate Limiting**: Graceful handling of API rate limits
- **Type Safety**: Full TypeScript support

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Chart.js with react-chartjs-2
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding a Widget

1. Click the **"+ Add Widget"** button
2. Enter a widget name (e.g., "Bitcoin Price Tracker")
3. Provide an API URL (e.g., `https://api.coinbase.com/v2/exchange-rates?currency=BTC`)
4. Click **"Test"** to validate the API connection
5. Select fields to display from the API response
6. Choose display mode (Card, Table, or Chart)
7. Set refresh interval (minimum 5 seconds)
8. Click **"Add Widget"**

### Widget Management

- **Refresh**: Click the refresh icon to manually update data
- **Configure**: Click the settings icon to modify widget settings
- **Delete**: Click the trash icon to remove the widget
- **Reorder**: Drag and drop widgets to rearrange them

### Supported APIs

The dashboard works with any JSON API that returns financial data. Some popular examples:

- **Coinbase API**: `https://api.coinbase.com/v2/exchange-rates?currency=BTC`
- **Alpha Vantage**: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=YOUR_API_KEY`
- **Finnhub**: `https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY`

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── widgets/        # Widget-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── services/           # API services
├── stores/             # Zustand stores
└── types/              # TypeScript type definitions
```

## API Integration

### Adding New APIs

1. **Test the API**: Use the "Test" button in the widget creation modal
2. **Select Fields**: Choose which data fields to display
3. **Configure Display**: Set up how the data should be presented
4. **Set Refresh Rate**: Configure how often to update the data

### API Requirements

- Must return JSON data
- Should be accessible via CORS or use a proxy
- Rate limits are handled automatically with caching

## Customization

### Themes
The dashboard supports both light and dark themes. Toggle between them using the theme switcher in the header.

### Widget Configuration
Each widget can be customized with:
- Custom refresh intervals
- Field selection and formatting
- Display mode (Card, Table, Chart)
- Search and pagination settings

## Performance

- **Caching**: API responses are cached for 5 minutes to reduce requests
- **Lazy Loading**: Components are loaded on demand
- **Optimized Rendering**: Efficient re-rendering with React best practices

## Error Handling

The application includes comprehensive error handling:
- API connection failures
- Rate limit exceeded
- Invalid data formats
- Network timeouts
- User-friendly error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.