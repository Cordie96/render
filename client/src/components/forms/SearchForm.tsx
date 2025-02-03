import { TextInput, ActionIcon, Group } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useForm } from '@mantine/form';

interface SearchFormValues {
  query: string;
}

interface SearchFormProps {
  onSubmit: (values: SearchFormValues) => Promise<void>;
  loading?: boolean;
}

export default function SearchForm({ onSubmit, loading }: SearchFormProps) {
  const form = useForm<SearchFormValues>({
    initialValues: {
      query: '',
    },
    validate: {
      query: (value) => (!value.trim() ? 'Search query is required' : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Group spacing={0}>
        <TextInput
          placeholder="Search for songs..."
          {...form.getInputProps('query')}
          icon={<IconSearch size={16} />}
          rightSection={
            form.values.query && (
              <ActionIcon onClick={() => form.setFieldValue('query', '')}>
                <IconX size={16} />
              </ActionIcon>
            )
          }
          style={{ flex: 1 }}
          disabled={loading}
        />
      </Group>
    </form>
  );
} 