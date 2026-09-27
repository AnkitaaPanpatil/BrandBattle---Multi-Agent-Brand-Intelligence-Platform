import { useEffect, useRef } from 'react';

export interface KeyboardShortcutInfo {
  key: string;
  description: string;
}

export interface KeyboardNavigationOptions {
  /** The current active stage (1, 2, or 3) */
  currentStage: number;
  /** Callback to proceed to the next stage (triggered by Ctrl+Enter / Cmd+Enter) */
  onNextStage?: () => void;
  /** Callback to save the current kit (triggered by Ctrl+S / Cmd+S if currentStage === 3) */
  onSaveKit?: () => void;
  /** Callback to close any open modals or drawers (triggered by Escape) */
  onCloseModals?: () => void;
  /** Whether any modal or drawer is currently open */
  isAnyModalOpen?: boolean;
  /** Optional callback when Ctrl+S is pressed outside Stage 3 */
  onSaveUnavailable?: () => void;
  /** Whether keyboard shortcuts are disabled */
  disabled?: boolean;
}

export interface UseKeyboardNavigationReturn {
  shortcuts: KeyboardShortcutInfo[];
}

/**
 * Custom hook to handle keyboard navigation for the multi-stage flow:
 * - 'Ctrl+Enter' (or 'Cmd+Enter'): Proceed to the next stage
 * - 'Ctrl+S' (or 'Cmd+S'): Save the current kit if in stage 3
 * - 'Escape': Close any open modals or drawers
 */
export function useKeyboardNavigation({
  currentStage,
  onNextStage,
  onSaveKit,
  onCloseModals,
  isAnyModalOpen = false,
  onSaveUnavailable,
  disabled = false,
}: KeyboardNavigationOptions): UseKeyboardNavigationReturn {
  const optionsRef = useRef({
    currentStage,
    onNextStage,
    onSaveKit,
    onCloseModals,
    isAnyModalOpen,
    onSaveUnavailable,
    disabled,
  });

  // Always keep ref in sync with latest props/closures without re-binding window listener
  useEffect(() => {
    optionsRef.current = {
      currentStage,
      onNextStage,
      onSaveKit,
      onCloseModals,
      isAnyModalOpen,
      onSaveUnavailable,
      disabled,
    };
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const {
        currentStage: stage,
        onNextStage: nextStageHandler,
        onSaveKit: saveKitHandler,
        onCloseModals: closeModalsHandler,
        isAnyModalOpen: modalOpen,
        onSaveUnavailable: saveUnavailableHandler,
        disabled: isDisabled,
      } = optionsRef.current;

      if (isDisabled) return;

      const isCtrlOrMeta = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;
      const isAlt = event.altKey;

      // 1. 'Escape': Close any open modals or drawers
      if (event.key === 'Escape' || event.key === 'Esc') {
        if (modalOpen && closeModalsHandler) {
          event.preventDefault();
          event.stopPropagation();
          closeModalsHandler();
          return;
        }
      }

      // 2. 'Ctrl+S': Save the current kit if in stage 3
      if (isCtrlOrMeta && !isShift && !isAlt && (event.key === 's' || event.key === 'S')) {
        event.preventDefault(); // Always prevent default browser "Save Page As"
        if (stage === 3) {
          if (saveKitHandler) {
            saveKitHandler();
          }
        } else {
          if (saveUnavailableHandler) {
            saveUnavailableHandler();
          }
        }
        return;
      }

      // 3. 'Ctrl+Enter': Proceed to the next stage
      if (isCtrlOrMeta && !isAlt && event.key === 'Enter') {
        // If a modal or drawer is open, don't advance the stage behind it
        if (modalOpen) return;

        if (nextStageHandler) {
          event.preventDefault();
          nextStageHandler();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    shortcuts: [
      { key: 'Ctrl + Enter', description: 'Proceed to next stage' },
      { key: 'Ctrl + S', description: 'Save brand kit (Stage 3)' },
      { key: 'Esc', description: 'Close modals or drawers' },
    ],
  };
}
