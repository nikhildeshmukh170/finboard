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

  // Make the whole card clickable except for drag handle and action buttons
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="h-full group relative"
      onClick={() => props.onClick?.(props.widget)}
    >
      {/* Drag handle overlay (stop propagation so drag doesn't trigger click) */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 cursor-move"
        onClick={e => e.stopPropagation()}
      />
      <WidgetFactory {...props} />
    </div>
  );
};

export { SortableWidget };
