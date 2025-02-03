import { TextInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';

interface RoomFormValues {
  name: string;
}

interface RoomFormProps {
  onSubmit: (values: RoomFormValues) => Promise<void>;
  loading?: boolean;
}

export default function RoomForm({ onSubmit, loading }: RoomFormProps) {
  const form = useForm<RoomFormValues>({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => {
        if (!value) return 'Room name is required';
        if (value.length < 3) return 'Room name must be at least 3 characters';
        if (value.length > 50) return 'Room name must be less than 50 characters';
        return null;
      },
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack spacing="md">
        <TextInput
          label="Room Name"
          placeholder="Enter room name"
          {...form.getInputProps('name')}
          disabled={loading}
          required
        />
        <Button type="submit" loading={loading}>
          Create Room
        </Button>
      </Stack>
    </form>
  );
} 