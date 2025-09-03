"use client";
import React from 'react';
import { Widget } from '@/types';
import { WidgetFactory } from './WidgetFactory';
import { useSortableWidget } from '@/hooks/useDragAndDrop';

interface SortableWidgetProps {
  widget: Widget;
  onRefresh: (id: string) => void;
  onConfigure: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onClick?: (widget: Widget) => void;
}

const SortableWidget: React.FC<SortableWidgetProps> = (props) => {
  const { setNodeRef, style, attributes, listeners } = useSortableWidget(props.widget);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move"
    >
      <WidgetFactory {...props} />
    </div>
  );
};

export { SortableWidget };
