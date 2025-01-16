import { useEffect, useCallback } from 'react';
import FocusManager from '../utils/FocusManager';

interface UseFocusScopeProps {
  scopeId: string;
  priority?: number;
  stopPropagation?: boolean;
}

export function useFocusScope({ 
  scopeId, 
  priority = 0,
  stopPropagation = false 
}: UseFocusScopeProps) {
  useEffect(() => {
    FocusManager.registerScope(scopeId, priority);
    return () => FocusManager.unregisterScope(scopeId);
  }, [scopeId, priority]);

  const handleKeyboardEvent = useCallback(
    (event: KeyboardEvent): boolean => {
      const shouldHandle = FocusManager.shouldHandleEvent(scopeId, event);
      if (shouldHandle && stopPropagation) {
        event.stopPropagation();
      }
      return shouldHandle;
    },
    [scopeId, stopPropagation]
  );

  const handleWheelEvent = useCallback(
    (event: WheelEvent): boolean => {
      const shouldHandle = FocusManager.shouldHandleEvent(scopeId, event);
      if (shouldHandle && stopPropagation) {
        event.stopPropagation();
      }
      return shouldHandle;
    },
    [scopeId, stopPropagation]
  );

  const setActive = useCallback(() => {
    FocusManager.setActiveScope(scopeId);
  }, [scopeId]);

  const clearActive = useCallback(() => {
    FocusManager.clearActiveScope();
  }, []);

  return {
    handleKeyboardEvent,
    handleWheelEvent,
    setActive,
    clearActive,
  };
} 