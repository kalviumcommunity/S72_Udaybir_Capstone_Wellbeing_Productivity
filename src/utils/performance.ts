// Performance monitoring utility

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: Set<(metric: PerformanceMetric) => void> = new Set();

  // Start timing an operation
  startTimer(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };
    this.metrics.set(name, metric);
  }

  // End timing an operation
  endTimer(name: string): PerformanceMetric | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Timer "${name}" was not started`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Notify observers
    this.observers.forEach(observer => observer(metric));

    // Log slow operations
    if (metric.duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
    }

    this.metrics.delete(name);
    return metric;
  }

  // Measure async operation
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTimer(name, metadata);
    try {
      const result = await operation();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  // Measure sync operation
  measureSync<T>(
    name: string,
    operation: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startTimer(name, metadata);
    try {
      const result = operation();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  // Add observer for performance metrics
  addObserver(observer: (metric: PerformanceMetric) => void): void {
    this.observers.add(observer);
  }

  // Remove observer
  removeObserver(observer: (metric: PerformanceMetric) => void): void {
    this.observers.delete(observer);
  }

  // Get all active timers
  getActiveTimers(): string[] {
    return Array.from(this.metrics.keys());
  }

  // Clear all timers
  clearTimers(): void {
    this.metrics.clear();
  }

  // Get performance report
  getReport(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }
}

// Create global performance monitor
export const performanceMonitor = new PerformanceMonitor();

// Helper functions for common performance measurements
export const measureApiCall = async <T>(
  endpoint: string,
  operation: () => Promise<T>
): Promise<T> => {
  return performanceMonitor.measureAsync(`API:${endpoint}`, operation, { endpoint });
};

export const measureRender = (componentName: string, operation: () => void): void => {
  performanceMonitor.measureSync(`Render:${componentName}`, operation, { component: componentName });
};

export const measureUserInteraction = (action: string, operation: () => void): void => {
  performanceMonitor.measureSync(`Interaction:${action}`, operation, { action });
};

// Memory usage monitoring
export const getMemoryUsage = (): { used: number; total: number; percentage: number } => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }
  return { used: 0, total: 0, percentage: 0 };
};

// Network performance monitoring
export const measureNetworkRequest = async <T>(
  url: string,
  operation: () => Promise<T>
): Promise<T> => {
  return performanceMonitor.measureAsync(`Network:${url}`, operation, { url });
}; 