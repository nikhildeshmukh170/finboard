"use client";
import React from 'react';
import { Move, ArrowUpDown } from 'lucide-react';
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
      {/* Visible drag handle (grip icon) */}
      <button
        type="button"
        aria-label="Drag widget"
        title="Drag to reorder"
        {...attributes}
        {...listeners}
        className="absolute bottom-2 right-2 z-10 cursor-grab bg-[var(--muted)] border border-[var(--border)] rounded-full p-2 shadow-md opacity-70 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 focus:outline-none"
        style={{
          boxShadow: '0 2px 8px 0 rgba(16,30,54,0.10)',
          display: 'block',
        }}
        onClick={e => e.stopPropagation()}
        tabIndex={0}
      >
        <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" />
      </button>
      <WidgetFactory {...props} />
    </div>
  );
};

export { SortableWidget };
