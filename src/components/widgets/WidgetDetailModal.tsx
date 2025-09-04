"use client";
import React, { useState } from 'react';
import { Widget } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { WidgetCard } from '@/components/widgets/WidgetCard';
import { WidgetTable } from '@/components/widgets/WidgetTable';
import { WidgetChart } from '@/components/widgets/WidgetChart';
import { RefreshCw, Settings, Trash2, BarChart3, Table, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetDetailModalProps {
  isOpen: boolean;
  widget: Widget | null;
  onClose: () => void;
  onRefresh: (id: string) => void;
  onConfigure: (id: string) => void;
  onDelete: (id: string) => void;
}

export const WidgetDetailModal: React.FC<WidgetDetailModalProps> = ({
  isOpen,
  widget,
  onClose,
  onRefresh,
  onConfigure,
  onDelete
}) => {
  const [visibleViews, setVisibleViews] = useState({
    card: true,
    table: true,
    chart: true
  });
  
  if (!widget) return null;

  const renderView = (viewType: 'card' | 'table' | 'chart') => {
    const commonProps = {
      widget,
      onRefresh,
      onConfigure,
      onDelete,
      onEdit: onConfigure,
      onClick: undefined as (() => void) | undefined
    };

    switch (viewType) {
      case 'card':
        return <WidgetCard {...commonProps} />;
      case 'table':
        return <WidgetTable {...commonProps} />;
      case 'chart':
        return <WidgetChart {...commonProps} />;
      default:
        return null;
    }
  };

  const toggleView = (view: keyof typeof visibleViews) => {
    setVisibleViews(prev => ({
      ...prev,
      [view]: !prev[view]
    }));
  };

  const viewConfigs = [
    { key: 'card' as const, label: 'Card View', icon: BarChart3, description: 'Compact data display' },
    { key: 'table' as const, label: 'Table View', icon: Table, description: 'Detailed tabular data' },
    { key: 'chart' as const, label: 'Chart View', icon: TrendingUp, description: 'Visual data representation' }
  ];

  const visibleCount = Object.values(visibleViews).filter(Boolean).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={widget.name}>
      <div className="flex flex-col gap-6">
        {/* Header with widget info and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Type: <span className="uppercase font-medium">{widget.type}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              API: <span className="font-mono text-xs">{widget.apiUrl}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Refresh: <span className="font-medium">{widget.refreshInterval}s</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefresh(widget.id)}
              disabled={widget.isLoading}
              className="h-8 w-8 p-0"
              title="Refresh"
            >
              <RefreshCw className={cn('h-4 w-4', widget.isLoading && 'animate-spin')} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onConfigure(widget.id)}
              className="h-8 w-8 p-0"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(widget.id)}
              className="h-8 w-8 p-0"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View Toggle Controls */}
        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Views:</span>
          {viewConfigs.map(({ key, label, icon: Icon, description }) => (
            <Button
              key={key}
              variant={visibleViews[key] ? "primary" : "ghost"}
              size="sm"
              onClick={() => toggleView(key)}
              className={cn(
                "flex items-center gap-2 px-3 py-1",
                visibleViews[key] 
                  ? "bg-white dark:bg-gray-600 shadow-sm" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
              title={description}
            >
              {visibleViews[key] ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              <Icon className="h-3 w-3" />
              {label}
            </Button>
          ))}
        </div>

        {/* Widget Views Grid */}
        <div className={cn(
          "grid gap-6",
          visibleCount === 1 ? "grid-cols-1" :
          visibleCount === 2 ? "grid-cols-2" : "grid-cols-3"
        )}>
          {viewConfigs.map(({ key, label }) => (
            visibleViews[key] && (
              <div key={key} className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleView(key)}
                    className="h-6 w-6 p-0 ml-auto"
                    title="Hide view"
                  >
                    <EyeOff className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-auto bg-white dark:bg-gray-800">
                  <div className="h-full">
                    {renderView(key)}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Raw Data Section */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            Raw API Data
          </div>
          <div className="p-4 max-h-64 overflow-auto text-xs bg-gray-50 dark:bg-gray-800">
            <pre className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">
              {JSON.stringify(widget.data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </Modal>
  );
};


