import { TextInput, ActionIcon } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

export default function SearchBar({ value, onChange, onSearch, loading }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        placeholder="Search for songs..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        icon={<IconSearch size={16} />}
        rightSection={
          value && (
            <ActionIcon onClick={() => onChange('')}>
              <IconX size={16} />
            </ActionIcon>
          )
        }
        disabled={loading}
      />
    </form>
  );
} 