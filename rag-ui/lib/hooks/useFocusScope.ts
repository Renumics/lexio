import { useEffect, useCallback } from 'react';
import FocusManager from '../utils/FocusManager';
import { KeyboardEvent as ReactKeyboardEvent } from 'react';

interface UseFocusScopeProps {
  scopeId: string;
  priority?: number;
  stopPropagation?: boolean;
}

/**
 * useFocusScope is a custom React hook that integrates with the FocusManager utility
 * to manage focus scopes within a React component. It allows components to register
 * themselves as focus scopes, set their active state, and handle keyboard and wheel
 * events based on their focus state and priority.
 *
 * This hook provides:
 * - Registration and unregistration of a focus scope with an optional priority.
 * - Event handlers for keyboard and wheel events that respect the focus scope's
 *   active state and priority.
 * - Methods to set and clear the active focus scope.
 *
 * @param {Object} props - The properties for configuring the focus scope.
 * @param {string} props.scopeId - A unique identifier for the focus scope.
 * @param {number} [props.priority=0] - The priority level of the focus scope.
 * @param {boolean} [props.stopPropagation=false] - Whether to stop event propagation
 * when the event is handled by this focus scope.
 *
 * @returns {Object} An object containing event handlers and methods to manage the focus scope.
 */
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
    (event: ReactKeyboardEvent | KeyboardEvent): boolean => {
      const nativeEvent = 'nativeEvent' in event ? event.nativeEvent : event;
      const shouldHandle = FocusManager.shouldHandleEvent(scopeId, nativeEvent);
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