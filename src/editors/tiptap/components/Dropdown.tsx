import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  /** Controlled open state */
  isOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** If true, don't close the dropdown when clicking inside children */
  closeOnContentClick?: boolean;
}

export function Dropdown({ 
  trigger, 
  children, 
  className = '',
  isOpen: controlledIsOpen,
  onOpenChange,
  closeOnContentClick = true,
}: DropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [dropdownElement, setDropdownElement] = useState<HTMLDivElement | null>(null);
  
  // Use controlled or internal state
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = useCallback((value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    }
    if (!isControlled) {
      setInternalIsOpen(value);
    }
  }, [isControlled, onOpenChange]);

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const setReferenceRef = useCallback((node: HTMLDivElement | null) => {
    refs.setReference(node);
  }, [refs]);

  const setFloatingRef = useCallback((node: HTMLDivElement | null) => {
    refs.setFloating(node);
  }, [refs]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, dropdownElement, setIsOpen]);

  return (
    <div ref={setDropdownElement} className={`dropdown ${className}`}>
      <div ref={setReferenceRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={setFloatingRef}
          style={floatingStyles}
          className="dropdown-menu"
          onClick={closeOnContentClick ? () => setIsOpen(false) : undefined}
        >
          {children}
        </div>
      )}
    </div>
  );
}
