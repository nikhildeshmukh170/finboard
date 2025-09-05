# FinBoard - Finance Dashboard

<p align="center">
	<img width="225" height="225" alt="Finboard logo" src="https://github.com/user-attachments/assets/67334454-92f8-4e16-b3e5-d90b011fa01a" />
</p>
<p align="center">
	<b>Customizable, real-time finance dashboard for all your data needs</b><br/>
</p>

<p align="center">
	<img alt="Build" src="https://img.shields.io/badge/build-passing-brightgreen" />
	<img alt="License" src="https://img.shields.io/badge/license-MIT-blue" />
	<img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-blue" />
	<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue" />
	<img alt="Tailwind" src="https://img.shields.io/badge/TailwindCSS-4-blue" />
</p>

---
FinBoard is a modern, customizable finance dashboard built with Next.js, Zustand, and Tailwind CSS. Connect to any financial API and visualize real-time data with beautiful, responsive widgets. Drag, drop, and configure your dashboard to fit your workflow—on desktop or mobile.

---
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

## 🛠️ How It Works

1. **Add a Widget**: Click "+ Add Widget", enter an API URL, test the connection, and select fields to display.
2. **Choose Display**: Pick Card, Table, or Chart view. Configure refresh interval and formatting.
3. **Drag & Drop**: Rearrange widgets by dragging the handle in the corner of each card.
4. **Configure or Delete**: Use the settings or trash icons to update or remove widgets anytime.
5. **Theme & Export**: Switch between dark/light mode, export/import your dashboard, or load templates.

---

## 📸 Screenshots & Diagrams

**#Flow Charts**

- **Class Diagram**
<img width="500" height="500" alt="Untitled diagram _ Mermaid Chart-2025-09-04-155002" src="https://github.com/user-attachments/assets/309665be-1119-42fd-bf0a-40a234211d52" />

- **UML Activity Diagram**
<img width="3151" height="1000" alt="Untitled diagram _ Mermaid Chart-2025-09-04-215821" src="https://github.com/user-attachments/assets/f1f2950d-8fd4-4d9e-8dea-fe192738ab7d" />

- **Sequence Diagram**
<img width="3840" height="1000" alt="Untitled diagram _ Mermaid Chart-2025-09-04-220204" src="https://github.com/user-attachments/assets/077e6f58-8a5e-4345-a3b0-4a7c06beae74" />

## UI
### Dark Theme

- **Dashboard**
<img width="1762" height="926" alt="image" src="https://github.com/user-attachments/assets/23f8133a-d030-4b89-8e48-d126a01c2209" />

- **Add New Widget**
<img width="1709" height="890" alt="image" src="https://github.com/user-attachments/assets/c1a88000-78da-439e-a6de-e3a1494c9b23" />
<img width="1639" height="845" alt="image" src="https://github.com/user-attachments/assets/00b0638f-993e-404c-945e-824f7dca1538" />

- **Card Open Model**
<img width="1640" height="912" alt="image" src="https://github.com/user-attachments/assets/fcc89125-e0e1-4313-88b8-c77aee05b0b4" />

- **Mobile View**
<img width="488" height="829" alt="image" src="https://github.com/user-attachments/assets/53fa7323-de3c-4d52-8d8d-44b633363f21" />



<hr/>

### -Light Theme

- **Dashboard**
<img width="1736" height="929" alt="image" src="https://github.com/user-attachments/assets/51e1fc24-b62b-42a5-a4e6-1ab6b2ab52f7" />




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

---

## 📱 Mobile Experience

FinBoard is designed mobile-first. All features, including drag-and-drop, widget configuration, and theming, work seamlessly on phones and tablets. The UI adapts for touch, and all controls remain accessible.

---

## ❓ FAQ

**Q: Can I use any API?**
A: Yes! As long as it returns JSON and is CORS-accessible, you can connect it.

**Q: Is my data private?**
A: All configuration and data stay in your browser. Nothing is sent to a backend.

**Q: Can I export/import my dashboard?**
A: Yes, use the export/import buttons in the header.

**Q: How do I reorder widgets?**
A: Drag the handle (bottom-right of each widget) to move them.

**Q: Does it work on mobile?**
A: Yes, the dashboard is fully responsive and touch-friendly.

---

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
