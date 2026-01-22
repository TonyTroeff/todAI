import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

export type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';

type SnackbarContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

const AUTO_HIDE_MS = 4000;

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const show = useCallback((severity: SnackbarSeverity, message: string) => {
    setState({ open: true, severity, message });
  }, []);

  const value = useMemo<SnackbarContextValue>(
    () => ({
      showSuccess: (message) => show('success', message),
      showError: (message) => show('error', message),
      showInfo: (message) => show('info', message),
      showWarning: (message) => show('warning', message),
    }),
    [show]
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={AUTO_HIDE_MS}
        onClose={(_event, reason) => {
          if (reason === 'clickaway') return;
          setState((prev) => ({ ...prev, open: false }));
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setState((prev) => ({ ...prev, open: false }))}
          severity={state.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}
