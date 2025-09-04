"use client";
import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Widget } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RefreshCw, Settings, Trash2, TrendingUp } from 'lucide-react';
import { cn, getNestedValue, formatLastUpdated } from '@/lib/utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WidgetChartProps {
  widget: Widget;
  onRefresh: (id: string) => void;
  onConfigure: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onClick?: (widget: Widget) => void;
}

const WidgetChart: React.FC<WidgetChartProps> = ({
  widget,
  onRefresh,
  onConfigure,
  onDelete,
  onClick
}) => {
         const chartData = useMemo(() => {
     console.log('🔄 WidgetChart - Processing data for widget:', widget.name);
     console.log('📊 Widget data:', widget.data);
     console.log('🎯 Selected fields:', widget.selectedFields);
     console.log('📊 Widget data type:', typeof widget.data);
     console.log('📊 Widget data is array:', Array.isArray(widget.data));
     
     if (!widget.data || !widget.selectedFields.length) {
       console.log('❌ No data or selected fields');
       return null;
     }

    // Handle different data structures
    let labels: string[] = [];
    let datasets: any[] = [];

    // Check if we have forex-style data (object with rates)
    if (widget.data.rates && typeof widget.data.rates === 'object') {
      console.log('💱 Processing forex-style data');
      // Forex data structure - only use selected numeric fields
      const selectedNumericFields = widget.selectedFields.filter(field => 
        field.type === 'number' && field.path.startsWith('rates.')
      );
      
      if (selectedNumericFields.length === 0) {
        console.log('❌ No numeric fields found for forex data');
        return null;
      }
      
      const currencyNames = selectedNumericFields.map(field => 
        field.path.replace('rates.', '')
      );
      labels = currencyNames;
      
      datasets = selectedNumericFields.map((field, index) => {
        const colors = [
          'rgb(34, 197, 94)', // green-500
          'rgb(239, 68, 68)', // red-500
          'rgb(59, 130, 246)', // blue-500
          'rgb(168, 85, 247)', // purple-500
          'rgb(245, 158, 11)', // amber-500
        ];
        
        return {
          label: field.label,
          data: currencyNames.map(currency => widget.data.rates[currency]),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + '20',
          tension: 0.4,
          fill: false,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        };
      });
         } else {
       console.log('📊 Processing object-style data');
       // Object data structure - handle Alpha Vantage style data
       let dataArray = null;
       
       // Check if we have Alpha Vantage style data with "Technical Analysis" or similar
       if (widget.data['Technical Analysis: SMA'] || widget.data['Technical Analysis'] || widget.data['Time Series (Daily)'] || widget.data['Time Series (Intraday)']) {
         console.log('📈 Found Alpha Vantage style data');
         
         // Find the technical analysis data
         const techAnalysisKey = Object.keys(widget.data).find(key => 
           key.includes('Technical Analysis') || key.includes('Time Series')
         );
         
         if (techAnalysisKey) {
           console.log('📋 Found technical analysis key:', techAnalysisKey);
           const techData = widget.data[techAnalysisKey];
           
           // Convert the object to array format for charting
           if (typeof techData === 'object' && techData !== null) {
             dataArray = Object.entries(techData).map(([date, values]) => ({
               date,
               ...values
             }));
             console.log('✅ Converted technical data to array, length:', dataArray.length);
           }
         }
       } else {
         // Try to find array data in the response
         console.log('🔍 Data is not an array, searching for array fields...');
         
         // Check if any selected field points to an array
         const arrayField = widget.selectedFields.find(field => field.type === 'array');
         if (arrayField) {
           console.log('📋 Found array field:', arrayField.path);
           dataArray = getNestedValue(widget.data, arrayField.path);
         } else {
           // If no array field is selected, try to find any array in the data
           const findArrayInObject = (obj: any, path = ''): any[] | null => {
             if (Array.isArray(obj)) return obj;
             if (typeof obj === 'object' && obj !== null) {
               for (const [key, value] of Object.entries(obj)) {
                 const newPath = path ? `${path}.${key}` : key;
                 if (Array.isArray(value)) {
                   console.log('📋 Found array at path:', newPath);
                   return value;
                 }
                 const result = findArrayInObject(value, newPath);
                 if (result) return result;
               }
             }
             return null;
           };
           
           dataArray = findArrayInObject(widget.data);
           if (dataArray) {
             console.log('✅ Found array data, length:', dataArray.length);
           }
         }
       }
      
             if (!Array.isArray(dataArray) || dataArray.length === 0) {
         console.log('❌ No array data found');
         console.log('📊 DataArray type:', typeof dataArray);
         console.log('📊 DataArray is array:', Array.isArray(dataArray));
         console.log('📊 DataArray length:', dataArray ? dataArray.length : 'undefined');
         return null;
       }

             // Filter to only numeric fields for charting
       const numericFields = widget.selectedFields.filter(field => field.type === 'number');
       console.log('🔢 Numeric fields found:', numericFields.length);
       console.log('🔢 Numeric fields:', numericFields);
       
       if (numericFields.length === 0) {
         console.log('❌ No numeric fields found for charting');
         console.log('🎯 All selected fields:', widget.selectedFields);
         return null;
       }

             // For array data, use the data items themselves as x-axis labels
       // Each item in the array becomes a point on the x-axis
       console.log('🔍 Processing array data for labels, first item:', dataArray[0]);
       console.log('🎯 Selected fields:', widget.selectedFields);
       
       labels = dataArray.map((item: any, index: number) => {
         // First, try to find a good label field from the actual data structure
         let labelValue = null;
         
         // For Alpha Vantage data, use the date as label
         if (item.date) {
           labelValue = item.date;
         } else if (item.symbol) {
           labelValue = item.symbol;
         } else if (item.name) {
           labelValue = item.name;
         } else if (item.id) {
           labelValue = item.id;
         } else if (item.title) {
           labelValue = item.title;
         } else if (item.pair) {
           labelValue = item.pair;
         } else {
           // If no common identifier found, try to find a string field from selected fields
           const stringField = widget.selectedFields.find(field => 
             field.type === 'string' && 
             (field.path.includes('symbol') || field.path.includes('name') || field.path.includes('id') || field.path.includes('title'))
           ) || widget.selectedFields.find(field => field.type === 'string');
           
           if (stringField) {
             labelValue = getNestedValue(item, stringField.path);
           }
         }
         
         // If still no label found, try to use the first string value from the item
         if (!labelValue && typeof item === 'object') {
           for (const [key, value] of Object.entries(item)) {
             if (typeof value === 'string' && value.length < 20) { // Avoid very long strings
               labelValue = value;
               break;
             }
           }
         }
         
         const finalLabel = String(labelValue || `Item ${index + 1}`);
         console.log(`📝 Label for item ${index}:`, finalLabel, 'from value:', labelValue);
         return finalLabel;
       });

      // If no string fields found in selected fields, use index-based labels
      if (!widget.selectedFields.some(field => field.type === 'string')) {
        console.log('⚠️ No string fields found in selected fields, using index-based labels');
        labels = dataArray.map((_, index) => `Item ${index + 1}`);
      }

             // Create datasets only for numeric fields
       datasets = numericFields.map((field, index) => {
         const data = dataArray.map((item: any) => {
           // For Alpha Vantage data, the field path might be just the field name
           let value;
           if (field.path.includes('.')) {
             value = getNestedValue(item, field.path);
           } else {
             // Try direct field access first
             value = item[field.path];
             if (value === undefined) {
               // Fallback to nested value
               value = getNestedValue(item, field.path);
             }
           }
           return typeof value === 'number' ? value : 0;
         });

         const colors = [
           'rgb(34, 197, 94)', // green-500
           'rgb(239, 68, 68)', // red-500
           'rgb(59, 130, 246)', // blue-500
           'rgb(168, 85, 247)', // purple-500
           'rgb(245, 158, 11)', // amber-500
         ];

         return {
           label: field.label,
           data,
           borderColor: colors[index % colors.length],
           backgroundColor: colors[index % colors.length] + '20',
           tension: 0.4,
           fill: false,
           borderWidth: 2,
           pointRadius: 4,
           pointHoverRadius: 6,
         };
       });
    }

    console.log('📊 Final chart data:', { labels, datasets });
    console.log('📈 Chart labels (x-axis):', labels);
    console.log('📊 Chart datasets:', datasets.map(ds => ({ label: ds.label, dataLength: ds.data.length })));
    return {
      labels,
      datasets,
    };
  }, [widget.data, widget.selectedFields]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(107, 114, 128)', // gray-500
          font: {
            size: 10,
            weight: '500'
          },
          boxWidth: 12,
          padding: 8
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(34, 197, 94, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          size: 11
        },
        bodyFont: {
          size: 10
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(229, 231, 235, 0.3)', // gray-200 with transparency
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(107, 114, 128)', // gray-500
          font: {
            size: 9
          },
          maxRotation: 45,
          minRotation: 0
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(229, 231, 235, 0.3)', // gray-200 with transparency
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(107, 114, 128)', // gray-500
          font: {
            size: 9
          }
        },
        border: {
          display: false
        }
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: 'white',
        hoverBorderColor: 'rgb(34, 197, 94)',
        hoverBorderWidth: 2,
        radius: 3,
        hoverRadius: 5
      }
    }
  };

  const renderChartContent = () => {
    if (widget.isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (widget.error) {
      return (
        <div className="flex items-center justify-center h-64 text-red-600 dark:text-red-400">
          <div className="text-center">
            <p className="text-sm font-medium">Error loading data</p>
            <p className="text-xs mt-1">{widget.error}</p>
          </div>
        </div>
      );
    }

    if (!widget.selectedFields.length) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No fields selected</p>
            <p className="text-xs mt-1">Configure widget to display data</p>
          </div>
        </div>
      );
    }

    if (!chartData) {
      console.log('❌ Chart data is null/undefined for widget:', widget.name);
      console.log('📊 Widget data exists:', !!widget.data);
      console.log('📊 Widget data type:', typeof widget.data);
      console.log('📊 Widget data keys:', widget.data ? Object.keys(widget.data) : 'No data');
      console.log('🎯 Selected fields count:', widget.selectedFields.length);
      console.log('🎯 Selected fields:', widget.selectedFields);
      
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No data available</p>
            <p className="text-xs mt-1">Check your API configuration</p>
                         <div className="mt-2 text-xs text-gray-400">
               <p>Data exists: {widget.data ? 'Yes' : 'No'}</p>
               <p>Fields selected: {widget.selectedFields.length}</p>
               <p>Data type: {typeof widget.data}</p>
               <p>Is array: {Array.isArray(widget.data) ? 'Yes' : 'No'}</p>
               <p>Numeric fields: {widget.selectedFields.filter(f => f.type === 'number').length}</p>
               {widget.data && (
                 <p>Data keys: {Object.keys(widget.data).join(', ')}</p>
               )}
             </div>
          </div>
        </div>
      );
    }

    const ChartComponent = widget.config.chartType === 'bar' ? Bar : Line;

         return (
       <div className="h-64 w-full overflow-hidden">
         <ChartComponent data={chartData} options={chartOptions} />
       </div>
     );
  };

  return (
    <Card 
      className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group"
      onClick={() => onClick?.(widget)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
            <CardTitle className="text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" style={{ color: 'var(--card-foreground)' }}>
              {widget.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', borderRadius: 8, padding: '2px 10px' }}>
              {widget.refreshInterval}s
            </span>
                         <Button
               variant="ghost"
               size="sm"
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 onRefresh(widget.id);
               }}
               disabled={widget.isLoading}
               className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full"
               title="Refresh data"
             >
               <RefreshCw className={cn('h-4 w-4 text-blue-600 dark:text-blue-400', widget.isLoading && 'animate-spin')} />
             </Button>
             <Button
               variant="ghost"
               size="sm"
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 onConfigure(widget.id);
               }}
               className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
               title="Configure widget"
             >
               <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
             </Button>
             <Button
               variant="ghost"
               size="sm"
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 onDelete(widget.id);
               }}
               className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full"
               title="Delete widget"
             >
               <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
             </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {renderChartContent()}
        </div>
        
        {widget.lastUpdated && (
          <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Last updated: {formatLastUpdated(widget.lastUpdated)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { WidgetChart };
