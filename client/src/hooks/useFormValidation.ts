import { useState, useCallback } from 'react';

interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export function useFormValidation<T extends Record<string, any>>() {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback(<K extends keyof T>(
    field: K,
    value: T[K],
    rules: ValidationRule<T[K]>[]
  ) => {
    for (const rule of rules) {
      if (!rule.validate(value)) {
        setErrors(prev => ({ ...prev, [field]: rule.message }));
        return false;
      }
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    return true;
  }, []);

  const validateForm = useCallback((values: T, rules: Partial<Record<keyof T, ValidationRule<T[keyof T]>[]>>) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const [field, fieldRules] of Object.entries(rules)) {
      if (fieldRules) {
        for (const rule of fieldRules) {
          if (!rule.validate(values[field])) {
            newErrors[field as keyof T] = rule.message;
            isValid = false;
            break;
          }
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
  };
} 