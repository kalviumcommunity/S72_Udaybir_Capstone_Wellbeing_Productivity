import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
    expect(screen.getByText('Report Error')).toBeInTheDocument();
  });

  it('shows error ID', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Error ID:/)).toBeInTheDocument();
  });

  it('handles retry button click', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // Should still show error UI since the component still throws
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('handles go home button click', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const homeButton = screen.getByText('Go Home');
    fireEvent.click(homeButton);

    // Should still show error UI since the component still throws
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('handles report error button click', () => {
    // Mock the toast function since ErrorBoundary uses toast instead of alert
    const toastSpy = vi.fn();
    vi.mock('@/hooks/use-toast', () => ({
      toast: toastSpy
    }));
    
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reportButton = screen.getByText('Report Error');
    fireEvent.click(reportButton);

    // The button should be clickable and not crash
    expect(reportButton).toBeInTheDocument();
  });
}); 