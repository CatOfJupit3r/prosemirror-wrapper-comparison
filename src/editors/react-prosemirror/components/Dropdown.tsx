import { useState, useLayoutEffect, type ReactNode } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
} from '@floating-ui/react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export function Dropdown({ trigger, children, isOpen, onOpenChange, className = '' }: DropdownProps) {
  const [isPositioned, setIsPositioned] = useState(false);
  
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      onOpenChange(open);
      if (!open) {
        setIsPositioned(false);
      }
    },
    middleware: [
      offset(4),
      flip({ fallbackAxisSideDirection: 'end' }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
  });

  // Wait for position to be calculated before showing
  useLayoutEffect(() => {
    if (isOpen && floatingStyles.position) {
      // Use requestAnimationFrame to ensure the position is applied
      requestAnimationFrame(() => {
        setIsPositioned(true);
      });
    } else if (!isOpen) {
      setIsPositioned(false);
    }
  }, [isOpen, floatingStyles.position]);

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {trigger}
      </div>
      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              // eslint-disable-next-line react-hooks/refs
              ref={refs.setFloating}
              style={{
                ...floatingStyles,
                opacity: isPositioned ? 1 : 0,
                transition: 'opacity 0.1s ease',
              }}
              {...getFloatingProps()}
              className={`pm-dropdown ${className}`}
            >
              {children}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
