import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Replaced public class field for state initialization with a constructor.
  // This can resolve tooling issues where properties on `this` (like state and props)
  // might be incorrectly flagged as non-existent in older setups.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="h-full w-full flex items-center justify-center text-center p-4">
            <div>
                <h1 className="text-2xl font-bold text-red-500">Something went wrong.</h1>
                <p className="mt-2 text-medium-dark-text dark:text-medium-text">An unexpected error occurred. Please try refreshing the page.</p>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;