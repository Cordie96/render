import { Container, Paper, Title, TextInput, PasswordInput, Button, Stack, Text, Anchor } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFormSubmit } from '../hooks/useFormSubmit';
import ErrorAlert from '../components/ErrorAlert';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { login } = useAuth();
  const { loading, error, handleSubmit } = useFormSubmit<LoginFormValues>({
    onSubmit: async (values) => {
      await login(values.email, values.password);
    },
  });

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (!value ? 'Email is required' : null),
      password: (value) => (!value ? 'Password is required' : null),
    },
  });

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Stack spacing="lg">
          <Title order={2} align="center">
            Welcome Back
          </Title>

          {error && <ErrorAlert error={error} />}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack spacing="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                {...form.getInputProps('email')}
                disabled={loading}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                {...form.getInputProps('password')}
                disabled={loading}
              />

              <Button type="submit" loading={loading}>
                Login
              </Button>
            </Stack>
          </form>

          <Text align="center" size="sm">
            Don't have an account?{' '}
            <Anchor component={Link} to="/register">
              Register
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
} 