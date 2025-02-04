import { MantineThemeOverride } from '@mantine/core';

export const theme: MantineThemeOverride = {
  colorScheme: 'light',
  primaryColor: 'blue',
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
      },
    },
  },
  colors: {
    // Custom color palette that works well in both light and dark modes
    brand: [
      '#E3F2FD',
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#2196F3',
      '#1E88E5',
      '#1976D2',
      '#1565C0',
      '#0D47A1',
    ],
  },
  other: {
    transitionDuration: 200,
  },
  globalStyles: (theme) => ({
    body: {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[0],
      color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.dark[9],
    },
    '.card-hover': {
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows.md,
      },
    },
  }),
  // Dark mode specific overrides
  fn: {
    variant: ({ variant, color }) => {
      if (variant === 'light') {
        return {
          backgroundColor: theme.colorScheme === 'dark' ? 
            `rgba(${theme.colors[color][9]}, 0.15)` : 
            theme.colors[color][0],
        };
      }
      return {};
    },
  },
}; 