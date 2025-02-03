import { Container, Paper, Title, TextInput, PasswordInput, Button, Stack, Text, Anchor } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFormSubmit } from '../hooks/useFormSubmit';
import ErrorAlert from '../components/ErrorAlert';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const { register } = useAuth();
  const { loading, error, handleSubmit } = useFormSubmit<RegisterFormValues>({
    onSubmit: async (values) => {
      await register(values.email, values.password, values.name);
    },
  });

  const form = useForm<RegisterFormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      email: (value) => (!value ? 'Email is required' : null),
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Stack spacing="lg">
          <Title order={2} align="center">
            Create Account
          </Title>

          {error && <ErrorAlert error={error} />}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack spacing="md">
              <TextInput
                label="Name"
                placeholder="Your name"
                required
                {...form.getInputProps('name')}
                disabled={loading}
              />

              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                {...form.getInputProps('email')}
                disabled={loading}
              />

              <PasswordInput
                label="Password"
                placeholder="Create a password"
                required
                {...form.getInputProps('password')}
                disabled={loading}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                required
                {...form.getInputProps('confirmPassword')}
                disabled={loading}
              />

              <Button type="submit" loading={loading}>
                Register
              </Button>
            </Stack>
          </form>

          <Text align="center" size="sm">
            Already have an account?{' '}
            <Anchor component={Link} to="/login">
              Login
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
} 