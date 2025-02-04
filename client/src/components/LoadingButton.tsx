import { Button, ButtonProps, useMantineTheme } from '@mantine/core';
import { forwardRef } from 'react';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, loading, loadingText, sx, ...props }, ref) => {
    const theme = useMantineTheme();

    return (
      <Button
        ref={ref}
        loading={loading}
        sx={[
          (theme) => ({
            '&:not(:disabled)': {
              '&:hover': {
                backgroundColor: theme.fn.darken(
                  theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 9 : 6],
                  0.1
                ),
              },
            },
            '&:disabled': {
              backgroundColor: theme.colorScheme === 'dark'
                ? theme.colors.dark[5]
                : theme.colors.gray[2],
              color: theme.colorScheme === 'dark'
                ? theme.colors.dark[2]
                : theme.colors.gray[5],
            },
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      >
        {loading ? loadingText || 'Loading...' : children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton; 