"use client";
import React, { useState, useMemo } from 'react';
import { Widget } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/Input';
import { RefreshCw, Settings, Trash2, Table, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatCurrency, formatPercentage, formatNumber, getNestedValue, formatLastUpdated } from '@/lib/utils';

interface WidgetTableProps {
  widget: Widget;
  onRefresh: (id: string) => void;
  onConfigure: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onClick?: (widget: Widget) => void;
}

const WidgetTable: React.FC<WidgetTableProps> = ({
  widget,
  onRefresh,
  onConfigure,
  onDelete,
  onEdit,
  onClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = widget.config.itemsPerPage || 10;

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

  const tableData = useMemo(() => {
    console.log('🔄 WidgetTable - Processing data for widget:', widget.name);
    console.log('📊 Widget data:', widget.data);
    console.log('🎯 Selected fields:', widget.selectedFields);
    
    if (!widget.data || !widget.selectedFields.length) {
      console.log('❌ No data or selected fields');
      return [];
    }
    
    // Get the data array from the API response
    let dataArray = widget.data;
    
    // If the data is already an array, use it directly
    if (Array.isArray(widget.data)) {
      console.log('✅ Data is already an array, length:', widget.data.length);
      dataArray = widget.data;
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
    
    if (!Array.isArray(dataArray)) {
      console.log('❌ No array data found, treating as single item');
      // If no array found, treat the data as a single item
      dataArray = [widget.data];
    }
    
    console.log('📊 Final data array length:', dataArray.length);
    
    // Filter data based on search term
    if (searchTerm) {
      return dataArray.filter((item: any) => {
        return widget.selectedFields.some(field => {
          const value = getNestedValue(item, field.path);
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }
    
    return dataArray;
  }, [widget.data, widget.selectedFields, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tableData.slice(startIndex, startIndex + itemsPerPage);
  }, [tableData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const renderTableContent = () => {
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
          <div className="text-center">
            <p className="text-sm font-medium">Error loading data</p>
            <p className="text-xs mt-1">{widget.error}</p>
          </div>
        </div>
      );
    }

    if (!widget.selectedFields.length) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <Table className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No fields selected</p>
            <p className="text-xs mt-1">Configure widget to display data</p>
          </div>
        </div>
      );
    }

    if (paginatedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <Table className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No data available</p>
            <p className="text-xs mt-1">
              {searchTerm ? 'Try adjusting your search' : 'Check your API configuration'}
            </p>
                         <Button
               onClick={() => onRefresh(widget.id)}
               size="sm"
               className="mt-2"
             >
               Refresh Data
             </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Search */}
        {widget.config.searchEnabled && (
          <div
            className="relative mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              onClick={(e) => e.stopPropagation()}
              style={{ zIndex: 2 }}
            >
              <Search className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
            </span>
            <Input
              placeholder="Search table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'var(--muted)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                paddingLeft: 36,
                borderRadius: 8,
                height: 40,
                fontSize: 15,
                fontWeight: 500,
                boxShadow: 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

                                   {/* Table */}
          <div className="overflow-y-auto max-h-64 overflow-x-hidden">
            <table className="w-full text-sm">
             <thead className="sticky top-0 z-10" style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}>
               <tr style={{ borderBottom: '1px solid var(--border)' }}>
                 {widget.selectedFields.map((field, index) => (
                   <th
                     key={index}
                     className="text-left py-2 px-2 font-medium text-xs"
                     style={{ color: 'var(--foreground)' }}
                   >
                     {field.label}
                   </th>
                 ))}
               </tr>
             </thead>
             <tbody>
               {paginatedData.map((item: any, rowIndex: number) => (
                 <tr
                   key={rowIndex}
                   className="border-b hover:bg-[var(--muted)]"
                   style={{ borderBottom: '1px solid var(--border)', color: 'var(--foreground)', background: 'var(--card)' }}
                 >
                   {widget.selectedFields.map((field, colIndex) => {
                     const value = getNestedValue(item, field.path);
                     return (
                       <td
                         key={colIndex}
                         className="py-2 px-2 text-xs"
                         style={{ color: 'var(--foreground)' }}
                         title={String(formatValue(value, field.format))}
                       >
                         <div className="truncate max-w-[100px]">
                           {formatValue(value, field.format)}
                         </div>
                       </td>
                     );
                   })}
                 </tr>
               ))}
             </tbody>
           </table>
         </div>

        {/* Pagination */}
        {widget.config.paginationEnabled && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, tableData.length)} of {tableData.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card 
      className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group "
      onClick={() => onClick?.(widget)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="h-5 w-5 text-green-500 dark:text-green-400" />
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
          {renderTableContent()}
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

export { WidgetTable };
