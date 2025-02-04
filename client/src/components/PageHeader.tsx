import { Group, Title, Button, Stack, Text, useMantineTheme } from '@mantine/core';
import { TablerIcon } from '@tabler/icons-react';

interface Action {
  label: string;
  icon?: TablerIcon;
  onClick: () => void;
  variant?: 'filled' | 'light' | 'outline';
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: Action[];
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const theme = useMantineTheme();

  return (
    <Stack spacing="xs">
      <Group position="apart" align="center">
        <Title 
          order={2}
          sx={{
            color: theme.colorScheme === 'dark' ? theme.white : theme.black,
          }}
        >
          {title}
        </Title>

        {actions && actions.length > 0 && (
          <Group spacing="sm">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant || 'light'}
                  leftIcon={Icon && <Icon size={16} />}
                  onClick={action.onClick}
                  sx={(theme) => ({
                    '&:hover': {
                      backgroundColor: theme.fn.rgba(
                        theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 9 : 1],
                        0.35
                      ),
                    },
                  })}
                >
                  {action.label}
                </Button>
              );
            })}
          </Group>
        )}
      </Group>

      {subtitle && (
        <Text 
          color="dimmed"
          sx={{
            color: theme.colorScheme === 'dark' 
              ? theme.colors.dark[2] 
              : theme.colors.gray[6],
          }}
        >
          {subtitle}
        </Text>
      )}
    </Stack>
  );
} 