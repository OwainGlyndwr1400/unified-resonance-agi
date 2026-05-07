import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-rose-950/30 border border-rose-500/50 rounded-lg text-rose-200 flex flex-col gap-2">
          <h3 className="font-bold flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i> 
            System Module Failure
          </h3>
          <p className="text-xs mono">
            {this.state.error?.message || "Unknown Critical Error"}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/50 rounded text-xs uppercase transition-colors"
          >
            Attempt Reboot
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
