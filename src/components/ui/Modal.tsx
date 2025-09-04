"use client";
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm transition-opacity"
          style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className="relative w-full max-w-6xl rounded-lg shadow-xl"
          style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {title}
            </h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
