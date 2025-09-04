"use client";
import React from 'react';
import { Widget } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RefreshCw, Settings, Trash2, BarChart3 } from 'lucide-react';
import { cn, formatCurrency, formatPercentage, formatNumber, getNestedValue, formatLastUpdated } from '@/lib/utils';

interface WidgetCardProps {
  widget: Widget;
  onRefresh: (id: string) => void;
  onConfigure: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onClick?: (widget: Widget) => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({
  widget,
  onRefresh,
  onConfigure,
  onDelete,
  onClick
}) => {
  const formatValue = (value: any, format?: string) => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
      case 'currency':
        return typeof value === 'number' ? formatCurrency(value) : value;
      case 'percentage':
        return typeof value === 'number' ? formatPercentage(value) : value;
      case 'number':
        return typeof value === 'number' ? formatNumber(value) : value;
      default:
        return value;
    }
  };

  const renderWidgetContent = () => {
    if (widget.isLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (widget.error) {
      return (
        <div className="flex items-center justify-center h-32 text-red-600 dark:text-red-400">
          <div className="text-center p-4">
            <p className="text-sm font-medium">Error loading data</p>
            <p className="text-xs mt-1 max-w-xs break-words">{widget.error}</p>
            <button 
              onClick={() => onRefresh(widget.id)}
              className="text-xs mt-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    if (!widget.selectedFields.length) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No fields selected</p>
            <p className="text-xs mt-1">Configure widget to display data</p>
          </div>
        </div>
      );
    }

         return (
       <div className="space-y-2 max-h-48 overflow-y-auto overflow-x-hidden">
         {widget.selectedFields.map((field, index) => {
          const value = getNestedValue(widget.data, field.path);
          const formattedValue = formatValue(value, field.format);
          
          return (
            <div key={index} className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize flex-1 mr-2 truncate">
                {field.label.replace(/[._]/g, ' ')}
              </span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white text-right flex-1 truncate" title={String(formattedValue)}>
                {formattedValue}
              </span>
            </div>
          );
        })}
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
            <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <CardTitle className="text-lg text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {widget.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
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
               className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
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
               className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
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
               className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
               title="Delete widget"
             >
               <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
             </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {renderWidgetContent()}
        </div>
        
        {widget.lastUpdated && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {formatLastUpdated(widget.lastUpdated)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { WidgetCard };
