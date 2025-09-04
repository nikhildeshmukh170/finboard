"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  className?: string;
  onSelect?: () => void; // ✅ explicitly part of props
}

interface SelectValueProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  onValueChange,
  children,
  disabled,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <SelectTrigger
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <SelectValue />
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </SelectTrigger>

      {isOpen && (
        <SelectContent ref={contentRef}>
          {React.Children.map(children, (child) => {
            if (
              React.isValidElement<SelectItemProps>(child) &&
              child.type === SelectItem
            ) {
              return React.cloneElement(child, {
                onSelect: () => handleSelect(child.props.value),
              });
            }
            return child;
          })}
        </SelectContent>
      )}
    </div>
  );
};

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(({ children, className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      className
    )}
    {...props}
  >
    {children}
  </button>
));

SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute top-full left-0 z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

SelectContent.displayName = "SelectContent";

export const SelectItem: React.FC<SelectItemProps> = ({
  children,
  className,
  onSelect,
  ...props
}) => (
  <div
    className={cn(
      "px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer",
      className
    )}
    onClick={onSelect}
    {...props}
  >
    {children}
  </div>
);

export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder,
  className,
  ...props
}) => (
  <span
    className={cn("text-gray-900 dark:text-white", className)}
    {...props}
  >
    {placeholder || "Select an option"}
  </span>
);
