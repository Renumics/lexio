/**
 * FocusManager is a utility class that manages focus scopes within an application.
 * It allows for the registration and prioritization of focus scopes, enabling
 * components to determine whether they should handle specific events based on
 * their focus state and priority.
 *
 * The class maintains a map of registered focus scopes, each identified by a unique
 * ID and associated with a priority level. It also tracks the currently active focus
 * scope, allowing components to query and modify the active state.
 *
 * Key functionalities include:
 * - Registering and unregistering focus scopes with optional priority levels.
 * - Setting and clearing the active focus scope.
 * - Determining if a scope should handle a given event based on its priority and
 *   the current active scope.
 * - Checking if an element or its parents have scrollable content to decide event handling.
 */
type FocusScope = {
  id: string;
  priority: number;
};

class FocusManager {
  private static currentScope: FocusScope | null = null;
  private static scopes: Map<string, FocusScope> = new Map();

  static registerScope(id: string, priority: number = 0): void {
    this.scopes.set(id, { id, priority });
  }

  static unregisterScope(id: string): void {
    this.scopes.delete(id);
    if (this.currentScope?.id === id) {
      this.currentScope = null;
    }
  }

  static setActiveScope(id: string): void {
    const scope = this.scopes.get(id);
    if (scope) {
      this.currentScope = scope;
    }
  }

  static clearActiveScope(): void {
    this.currentScope = null;
  }

  static isActive(id: string): boolean {
    return this.currentScope?.id === id;
  }

  static shouldHandleEvent(scopeId: string, event: KeyboardEvent | WheelEvent): boolean {
    const scope = this.scopes.get(scopeId);
    if (!scope) return false;

    // If no active scope, allow the event
    if (!this.currentScope) return true;

    // If this is the active scope, allow the event
    if (this.currentScope.id === scopeId) return true;

    // For wheel events, only handle if the element or its parents have scrollable content
    if (event instanceof WheelEvent) {
      const element = event.currentTarget as HTMLElement;
      if (this.isScrollable(element)) {
        return true;
      }
    }

    // If this scope has higher priority than active scope, allow the event
    return scope.priority > this.currentScope.priority;
  }

  private static isScrollable(element: HTMLElement | null): boolean {
    while (element) {
      const { scrollHeight, clientHeight, scrollWidth, clientWidth } = element;
      if (scrollHeight > clientHeight || scrollWidth > clientWidth) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }
}

export default FocusManager; 