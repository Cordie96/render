import { Button, ButtonProps } from '@mantine/core';
import { forwardRef } from 'react';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, loading, loadingText, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        loading={loading}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? loadingText || 'Loading...' : children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton; 