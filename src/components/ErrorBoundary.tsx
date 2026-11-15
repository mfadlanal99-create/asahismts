import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches unexpected render or lazy-chunk errors so the app displays a
 * recovery screen instead of a blank page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB] p-6 text-slate-900 dark:bg-[#07101E] dark:text-slate-100">
          <div className="w-full max-w-md rounded-2xl border border-[#001F6B]/15 bg-white p-6 shadow-xl dark:border-[#3B82F6]/25 dark:bg-[#0C1829]">
            <h1 className="text-base font-bold text-[#001F6B] dark:text-[#60A5FA]">
              Application Error
            </h1>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
              {this.state.error.message || 'An unexpected rendering error occurred.'}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-[#001F6B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#002D9C]"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, '', '/');
                  this.setState({ error: null });
                }}
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
