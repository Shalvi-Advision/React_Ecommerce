import React, { Component } from 'react';
import { cleanup } from '../utils/apiOptimizer';

/**
 * API Error Boundary Component
 * 
 * This component catches errors that happen during API calls and renders a fallback UI
 * instead of crashing the whole application.
 */
class ApiErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Update error state
    const now = Date.now();
    const timeSinceLastError = this.state.lastErrorTime 
      ? now - this.state.lastErrorTime 
      : Infinity;

    // Reset error count if it's been more than 1 minute since the last error
    const errorCount = timeSinceLastError > 60000 ? 1 : this.state.errorCount + 1;

    this.setState({
      error,
      errorInfo,
      errorCount,
      lastErrorTime: now
    });

    // Log the error
    console.error('API Error caught by boundary:', error, errorInfo);
    
    // Clean up pending API requests if there are too many errors in a short time
    if (errorCount > 3 && timeSinceLastError < 10000) {
      console.warn('Too many API errors in short succession. Cleaning up pending requests.');
      cleanup();
    }
  }

  componentWillUnmount() {
    // Clean up any pending API requests when the component unmounts
    cleanup();
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      
      // Use custom fallback if provided
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback(this.state.error, this.reset)
          : fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
          <h2 className="text-lg font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-red-500 mb-2">
            There was an error loading data from the server.
          </p>
          <button
            onClick={this.reset}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-2 border border-red-200 rounded text-xs">
              <summary className="cursor-pointer text-red-600 font-medium">
                Error Details (Developer Only)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-red-800 bg-red-50 p-2 rounded overflow-auto max-h-64">
                {this.state.error?.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }

  reset = () => {
    // Reset the error boundary and clean up pending requests
    cleanup();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };
}

export default ApiErrorBoundary;
