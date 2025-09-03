"use client";
import React from 'react';
import { Widget } from '@/types';
import { WidgetCard } from './WidgetCard';
import { WidgetTable } from './WidgetTable';
import { WidgetChart } from './WidgetChart';

interface WidgetFactoryProps {
  widget: Widget;
  onRefresh: (id: string) => void;
  onConfigure: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const WidgetFactory: React.FC<WidgetFactoryProps> = (props) => {
  const { widget } = props;

  switch (widget.type) {
    case 'table':
      return <WidgetTable {...props} />;
    case 'chart':
      return <WidgetChart {...props} />;
    case 'card':
    default:
      return <WidgetCard {...props} />;
  }
};

export { WidgetFactory };
