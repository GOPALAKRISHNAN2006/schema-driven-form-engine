/**
 * ACCESSIBILITY UTILITIES
 * 
 * Helpers for focus management and screen reader announcements.
 */

/**
 * Focus an element by ID with smooth scroll into view.
 */
export function focusElement(id: string, options?: { preventScroll?: boolean }): void {
  const element = document.getElementById(id);
  if (!element) return;
  
  element.focus({ preventScroll: options?.preventScroll ?? false });
  
  if (!options?.preventScroll) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Focus the first invalid field in a form.
 */
export function focusFirstError(formElement?: HTMLFormElement): void {
  const form = formElement || document.querySelector('form');
  if (!form) return;
  
  const firstInvalid = form.querySelector<HTMLElement>(
    'input[aria-invalid="true"], select[aria-invalid="true"], textarea[aria-invalid="true"]'
  );
  
  if (firstInvalid) {
    firstInvalid.focus();
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Announce a message to screen readers using aria-live region.
 */
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  // Find or create announcement region
  let region = document.getElementById('sr-announcer');
  
  if (!region) {
    region = document.createElement('div');
    region.id = 'sr-announcer';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
  }
  
  // Update priority if needed
  region.setAttribute('aria-live', priority);
  
  // Clear and set message (triggers announcement)
  region.textContent = '';
  setTimeout(() => {
    region!.textContent = message;
  }, 100);
}

/**
 * Trap focus within an element (for modals/dialogs).
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  firstFocusable?.focus();
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Generate unique ID for accessibility associations.
 */
let idCounter = 0;
export function generateId(prefix = 'field'): string {
  return `${prefix}-${++idCounter}`;
}
