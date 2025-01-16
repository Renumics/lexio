import { useCallback } from 'react';

/**
 * A simple hook to manage event propagation in nested interactive components.
 * It provides handlers to stop event propagation when the component is active.
 */
export function useEventScope() {
  const handleKeyboardEvent = useCallback((event: React.KeyboardEvent) => {
    event.stopPropagation();
  }, []);

  const handleWheelEvent = useCallback((event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.stopPropagation();
      event.preventDefault();
    }
  }, []);

  return {
    handleKeyboardEvent,
    handleWheelEvent,
  };
} 