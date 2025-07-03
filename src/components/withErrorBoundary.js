'use client';

import ErrorBoundary from './ErrorBoundary';

export default function withErrorBoundary(Component, displayName = 'Component') {
  const WrappedComponent = (props) => {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}

export { ErrorBoundary };
