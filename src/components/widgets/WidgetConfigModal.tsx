"use client";
import React, { useState, useEffect } from 'react';
import { Widget, WidgetField } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { apiService } from '@/services/api';
import { RefreshCw, Trash2, Plus, X } from 'lucide-react';

interface WidgetConfigModalProps {
  widget: Widget;
  isOpen: boolean;
  onClose: () => void;
  onSave: (widget: Widget) => void;
  onDelete: (id: string) => void;
}

export const WidgetConfigModal: React.FC<WidgetConfigModalProps> = ({
  widget,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [name, setName] = useState(widget.name);
  const [apiUrl, setApiUrl] = useState(widget.apiUrl);
  const [refreshInterval, setRefreshInterval] = useState(widget.refreshInterval);
  const [selectedFields, setSelectedFields] = useState<WidgetField[]>(widget.selectedFields);
  const [availableFields, setAvailableFields] = useState<import('@/types').ApiField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
  if (isOpen && widget.apiUrl) {
    const testApiConnection = async () => {
      if (!widget.apiUrl) return;

      setIsLoading(true);
      setTestResult(null);

      try {
        const response = await apiService.testApiConnection(widget.apiUrl);
        setTestResult({
          success: response.success,
          message: response.message,
        });

        if (response.success && response.fields) {
          setAvailableFields(response.fields);
        }
      } catch (error) {
        setTestResult({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to test API connection",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // ✅ call the function
    testApiConnection();
  }
}, [isOpen, widget.apiUrl]);

  

  const addField = () => {
    const newField: WidgetField = {
      path: '',
      label: '',
      type: 'string',
      format: undefined
    };
    setSelectedFields([...selectedFields, newField]);
  };

  const removeField = (index: number) => {
    setSelectedFields(selectedFields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: Partial<WidgetField>) => {
    const newFields = [...selectedFields];
    newFields[index] = { ...newFields[index], ...field };
    setSelectedFields(newFields);
  };

  const handleSave = () => {
    const updatedWidget: Widget = {
      ...widget,
      name,
      apiUrl,
      refreshInterval,
      selectedFields
    };
    onSave(updatedWidget);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this widget?')) {
      onDelete(widget.id);
      onClose();
    }
  };

  const getFieldTypeOptions = () => {
    return [
      { value: 'string', label: 'Text' },
      { value: 'number', label: 'Number' },
      { value: 'currency', label: 'Currency' },
      { value: 'percentage', label: 'Percentage' },
      { value: 'date', label: 'Date' },
      { value: 'boolean', label: 'Boolean' }
    ];
  };

  const getFormatOptions = (type: string) => {
    switch (type) {
      case 'number':
        return [
          { value: undefined, label: 'Default' },
          { value: 'currency', label: 'Currency' },
          { value: 'percentage', label: 'Percentage' },
          { value: 'decimal', label: 'Decimal' }
        ];
      case 'string':
        return [
          { value: undefined, label: 'Default' },
          { value: 'uppercase', label: 'Uppercase' },
          { value: 'lowercase', label: 'Lowercase' },
          { value: 'capitalize', label: 'Capitalize' }
        ];
      default:
        return [{ value: undefined, label: 'Default' }];
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Widget">
      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Settings</h3>
          
          <div>
            <Label htmlFor="name">Widget Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter widget name"
            />
          </div>

          <div>
            <Label htmlFor="apiUrl">API URL</Label>
            <div className="flex gap-2">
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/data"
              />
              <Button
                onClick={testApiConnection}
                disabled={isLoading || !apiUrl}
                variant="outline"
                size="sm"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
              </Button>
            </div>
            {testResult && (
              <div className={`mt-2 text-sm ${testResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {testResult.message}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
            <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
                <SelectItem value="600">10 minutes</SelectItem>
                <SelectItem value="3600">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Field Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Fields</h3>
            <Button onClick={addField} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>

          {selectedFields.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No fields selected. Add fields to display data from your API.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedFields.map((field, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Field {index + 1}
                    </span>
                    <Button
                      onClick={() => removeField(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`path-${index}`}>Data Path</Label>
                      <Input
                        id={`path-${index}`}
                        value={field.path}
                        onChange={(e) => updateField(index, { path: e.target.value })}
                        placeholder="e.g., data.price"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`label-${index}`}>Display Label</Label>
                      <Input
                        id={`label-${index}`}
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="e.g., Price"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`type-${index}`}>Data Type</Label>
                      <Select value={field.type} onValueChange={(value) => updateField(index, { type: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getFieldTypeOptions().map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`format-${index}`}>Format</Label>
                      <Select value={field.format || ''} onValueChange={(value) => updateField(index, { format: value || undefined })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFormatOptions(field.type).map(option => (
                            <SelectItem key={option.value || 'default'} value={option.value || ''}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Fields Preview */}
        {availableFields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Available API Fields</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-40 overflow-y-auto">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Click on a field path to copy it:
              </div>
              <div className="space-y-1">
                {availableFields.map((field, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const newField: WidgetField = {
                        path: field.path,
                        label: field.path.split('.').pop() || field.path,
                        type: field.type === 'array' ? 'string' : field.type as any,
                        format: undefined
                      };
                      setSelectedFields([...selectedFields, newField]);
                    }}
                    className="block w-full text-left p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-mono text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {field.path} ({field.type})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleDelete}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Widget
          </Button>

          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name || !apiUrl || selectedFields.length === 0}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
