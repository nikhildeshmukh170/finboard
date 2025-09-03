"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Widget, FieldMapping, DisplayMode } from '@/types';
import { useDashboardStore } from '@/stores/dashboard';
import { Check, X, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const widgetSchema = z.object({
  name: z.string().min(1, 'Widget name is required'),
  apiUrl: z.string().url('Please enter a valid URL'),
  refreshInterval: z.number().min(5, 'Refresh interval must be at least 5 seconds'),
  displayMode: z.enum(['card', 'table', 'chart'] as const)
});

type WidgetFormData = z.infer<typeof widgetSchema>;

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'form' | 'fields'>('form');
  const [apiTestResult, setApiTestResult] = useState<{
    success: boolean;
    message: string;
    fields?: any[];
  } | null>(null);
  const [selectedFields, setSelectedFields] = useState<FieldMapping[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);
  
  const { addWidget, testApiConnection } = useDashboardStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<WidgetFormData>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      refreshInterval: 30,
      displayMode: 'card'
    }
  });

  const watchedApiUrl = watch('apiUrl');
  const watchedDisplayMode = watch('displayMode');

  const handleTestApi = async () => {
    if (!watchedApiUrl) return;
    
    setApiTestResult(null);
    const result = await testApiConnection(watchedApiUrl);
    setApiTestResult(result);
    
    if (result.success && result.fields) {
      setStep('fields');
    }
  };

  const handleFieldSelect = (field: any) => {
    const fieldMapping: FieldMapping = {
      path: field.path,
      label: field.path.split('.').pop() || field.path,
      type: field.type as any,
      format: field.type === 'number' ? 'number' : undefined
    };
    
    setSelectedFields(prev => [...prev, fieldMapping]);
  };

  const handleFieldRemove = (path: string) => {
    setSelectedFields(prev => prev.filter(field => field.path !== path));
  };

  const filteredFields = apiTestResult?.fields?.filter(field => {
    const matchesSearch = field.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArrayFilter = showArraysOnly ? field.isArray : true;
    return matchesSearch && matchesArrayFilter;
  }) || [];

  const onSubmit = async (data: WidgetFormData) => {
    if (step === 'form') {
      handleTestApi();
    } else {
      // Create widget
      await addWidget({
        name: data.name,
        type: data.displayMode,
        apiUrl: data.apiUrl,
        refreshInterval: data.refreshInterval,
        selectedFields,
        displayMode: data.displayMode,
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
        config: {
          showArraysOnly,
          searchEnabled: data.displayMode === 'table',
          paginationEnabled: data.displayMode === 'table',
          itemsPerPage: 10
        }
      });
      
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setStep('form');
    setApiTestResult(null);
    setSelectedFields([]);
    setSearchTerm('');
    setShowArraysOnly(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Widget" className="max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 'form' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Widget Name"
                placeholder="e.g., Bitcoin Price Tracker"
                {...register('name')}
                error={errors.name?.message}
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Display Mode
                </label>
                <div className="flex gap-2">
                  {(['card', 'table', 'chart'] as const).map((mode) => (
                    <Button
                      key={mode}
                      type="button"
                      variant={watchedDisplayMode === mode ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setValue('displayMode', mode)}
                      className="capitalize"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                API URL
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                  {...register('apiUrl')}
                  error={errors.apiUrl?.message}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleTestApi}
                  disabled={!watchedApiUrl}
                  className="px-4"
                >
                  Test
                </Button>
              </div>
              
              {/* Quick API Examples */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Quick examples:</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  💡 Tip: Some APIs may have CORS restrictions. The app will automatically use a proxy for known APIs.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('apiUrl', 'mock://bitcoin')}
                    className="text-xs"
                  >
                    Bitcoin Price
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('apiUrl', 'mock://stock')}
                    className="text-xs"
                  >
                    Stock Price
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('apiUrl', 'mock://forex')}
                    className="text-xs"
                  >
                    Forex Rates
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('apiUrl', 'mock://alphavantage')}
                    className="text-xs"
                  >
                    Alpha Vantage
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('apiUrl', 'https://api.exchangerate-api.com/v4/latest/USD')}
                    className="text-xs"
                  >
                    Exchange Rate API
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('apiUrl', 'https://api.coinbase.com/v2/exchange-rates?currency=BTC')}
                    className="text-xs"
                  >
                    Coinbase API
                  </Button>
                </div>
              </div>
              {apiTestResult && (
                <div className={cn(
                  'flex items-center gap-2 text-sm p-2 rounded',
                  apiTestResult.success 
                    ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
                    : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                )}>
                  {apiTestResult.success ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {apiTestResult.message}
                </div>
              )}
            </div>

            <Input
              label="Refresh Interval (seconds)"
              type="number"
              min="5"
              {...register('refreshInterval', { valueAsNumber: true })}
              error={errors.refreshInterval?.message}
            />
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Fields to Display</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search for fields..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showArraysOnly}
                      onChange={(e) => setShowArraysOnly(e.target.checked)}
                      className="rounded"
                    />
                    Show arrays only
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Available Fields</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredFields.map((field, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{field.path}</p>
                            <p className="text-xs text-gray-500">
                              {field.type} | {JSON.stringify(field.sampleValue).slice(0, 50)}
                              {JSON.stringify(field.sampleValue).length > 50 ? '...' : ''}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleFieldSelect(field)}
                            className="ml-2"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Selected Fields</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedFields.map((field, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{field.label}</p>
                            <p className="text-xs text-gray-500">{field.path}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFieldRemove(field.path)}
                            className="ml-2 text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {selectedFields.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No fields selected
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">
            {step === 'form' ? 'Test API' : 'Add Widget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export { AddWidgetModal };
