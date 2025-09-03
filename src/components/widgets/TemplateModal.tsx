"use client";
import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { dashboardTemplates } from '@/lib/dashboardTemplates';
import { BarChart3, TrendingUp, DollarSign, Globe } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (template: typeof dashboardTemplates[0]) => void;
}

const categoryIcons = {
  crypto: BarChart3,
  stocks: TrendingUp,
  forex: DollarSign,
  mixed: Globe
};

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onLoadTemplate
}) => {
  const categories = ['crypto', 'stocks', 'forex', 'mixed'] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dashboard Templates">
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-400">
          Choose from pre-built dashboard templates to get started quickly. Each template includes 
          sample widgets configured for different financial data sources.
        </p>

        {categories.map(category => {
          const templates = dashboardTemplates.filter(t => t.category === category);
          const Icon = categoryIcons[category];
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {category} Templates
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-green-500 dark:hover:border-green-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Preview: {template.preview}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {template.widgets.length} widget{template.widgets.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => onLoadTemplate(template)}
                      className="w-full"
                      size="sm"
                    >
                      Load Template
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
