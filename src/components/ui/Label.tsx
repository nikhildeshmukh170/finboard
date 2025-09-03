"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ htmlFor, children, className }) => (
  <label
    htmlFor={htmlFor}
    className={cn(
      'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
      className
    )}
  >
    {children}
  </label>
);
