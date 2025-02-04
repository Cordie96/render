import { TextInput, ActionIcon, Group, useMantineTheme } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useCallback } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

export default function SearchBar({ value, onChange, onSearch, loading }: SearchBarProps) {
  const theme = useMantineTheme();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  }, [onSearch]);

  return (
    <form onSubmit={handleSubmit}>
      <Group spacing={0}>
        <TextInput
          placeholder="Search for songs..."
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          style={{ flex: 1 }}
          rightSection={
            value && (
              <ActionIcon 
                onClick={() => onChange('')}
                variant="subtle"
                color="gray"
                sx={{
                  '&:hover': {
                    backgroundColor: theme.colorScheme === 'dark' 
                      ? theme.colors.dark[6] 
                      : theme.colors.gray[1],
                  },
                }}
              >
                <IconX size={16} />
              </ActionIcon>
            )
          }
          styles={(theme) => ({
            input: {
              '&:focus': {
                borderColor: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 8 : 5],
              },
            },
          })}
        />
        <ActionIcon
          type="submit"
          variant="filled"
          color={theme.primaryColor}
          size={36}
          loading={loading}
          disabled={!value.trim()}
          sx={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        >
          <IconSearch size={18} />
        </ActionIcon>
      </Group>
    </form>
  );
} 