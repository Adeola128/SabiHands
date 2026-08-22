import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: '#F1EFFB',
          padding: '20px'
        }}>
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            backgroundColor: '#FFFFFF', 
            borderRadius: '16px', 
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#FEE2E2', 
              color: '#EF4444', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px' 
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h2 style={{ color: 'var(--ink)', marginBottom: '8px' }}>Something went wrong</h2>
            <p style={{ color: 'var(--body)', marginBottom: '24px', fontSize: '15px' }}>
              We've encountered an unexpected error. Our team has been notified.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-solid-purple"
              >
                Refresh Page
              </button>
              <Link to="/" className="btn btn-outline-teal">
                Go to Homepage
              </Link>
            </div>
            {import.meta.env.MODE === 'development' && this.state.error && (
              <div style={{ marginTop: '24px', textAlign: 'left', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', overflowX: 'auto' }}>
                <pre style={{ fontSize: '12px', color: '#334155', margin: 0 }}>
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
