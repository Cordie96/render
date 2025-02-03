import { TextInput, ActionIcon, Group } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useCallback } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

export default function SearchBar({ value, onChange, onSearch, loading }: SearchBarProps) {
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) {
        onSearch();
      }
    },
    [value, onSearch]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Group spacing={0}>
        <TextInput
          placeholder="Search for songs..."
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          rightSection={
            value ? (
              <ActionIcon onClick={() => onChange('')}>
                <IconX size={16} />
              </ActionIcon>
            ) : undefined
          }
          style={{ flex: 1 }}
          disabled={loading}
        />
        <ActionIcon
          type="submit"
          variant="filled"
          color="blue"
          loading={loading}
          disabled={!value.trim()}
        >
          <IconSearch size={16} />
        </ActionIcon>
      </Group>
    </form>
  );
} 