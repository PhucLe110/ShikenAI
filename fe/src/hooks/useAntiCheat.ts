import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/services/api';

interface AntiCheatState {
  warnings: number;
  isTerminated: boolean;
  showWarningModal: boolean;
}

const MAX_WARNINGS = 3;

export const useAntiCheat = (examId: string | undefined) => {
  const [state, setState] = useState<AntiCheatState>({
    warnings: 0,
    isTerminated: false,
    showWarningModal: false,
  });

  const lastWarningTime = useRef<number>(0);

  const sendCheatLog = async (warnings: number, isTerminated: boolean) => {
    if (!examId) return;
    try {
      await api.post('/exams/cheat-log', {
        examId,
        warningCount: warnings,
        isTerminated,
        details: `Người dùng vi phạm lần ${warnings} (Chuyển tab / rời màn hình)`
      });
    } catch (error) {
      console.error('Failed to send cheat log', error);
    }
  };

  const handleCheatAttempt = useCallback(() => {
    const now = Date.now();
    // Ngăn chặn việc đếm đúp khi cả sự kiện blur và visibilitychange cùng kích hoạt gần nhau
    if (now - lastWarningTime.current < 1000) {
      return;
    }
    lastWarningTime.current = now;

    setState((prev) => {
      if (prev.isTerminated) return prev;

      const newWarnings = prev.warnings + 1;
      const isTerminated = newWarnings >= MAX_WARNINGS;

      // Gửi log về backend
      sendCheatLog(newWarnings, isTerminated);

      return {
        warnings: newWarnings,
        isTerminated,
        showWarningModal: true,
      };
    });
  }, [examId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleCheatAttempt();
      }
    };

    const handleBlur = () => {
      handleCheatAttempt();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleCheatAttempt]);

  const acknowledgeWarning = () => {
    setState((prev) => ({
      ...prev,
      showWarningModal: false,
    }));
  };

  return {
    warnings: state.warnings,
    isTerminated: state.isTerminated,
    showWarningModal: state.showWarningModal,
    acknowledgeWarning,
    maxWarnings: MAX_WARNINGS,
  };
};
