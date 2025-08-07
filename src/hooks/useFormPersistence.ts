import { useState, useEffect } from 'react';

interface UseFormPersistenceOptions<T> {
  key: string;
  initialValue?: T;
  debounceMs?: number;
  validate?: (value: T) => boolean;
}

export function useFormPersistence<T>({
  key,
  initialValue,
  debounceMs = 500,
  validate
}: UseFormPersistenceOptions<T>) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`form_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate the parsed data if validation function is provided
        if (validate && !validate(parsed)) {
          console.warn(`Invalid data for key ${key}, using initial value`);
          return initialValue;
        }
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Failed to load form data for key ${key}:`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // Validate before saving if validation function is provided
        if (validate && !validate(value)) {
          console.warn(`Invalid data for key ${key}, not saving`);
          return;
        }
        localStorage.setItem(`form_${key}`, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to save form data to localStorage:', error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [value, key, debounceMs, validate]);

  const clearForm = () => {
    try {
      localStorage.removeItem(`form_${key}`);
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error);
    }
    setValue(initialValue);
  };

  return [value, setValue, clearForm] as const;
} 