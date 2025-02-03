import { TextInput, PasswordInput, Button, Stack, Group, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';
import LoadingButton from '../LoadingButton';

interface AuthFormValues {
  email: string;
  password: string;
  username?: string;
  confirmPassword?: string;
}

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (values: AuthFormValues) => Promise<void>;
  loading?: boolean;
}

export default function AuthForm({ type, onSubmit, loading }: AuthFormProps) {
  const form = useForm<AuthFormValues>({
    initialValues: {
      email: '',
      password: '',
      ...(type === 'register' ? { username: '', confirmPassword: '' } : {}),
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email address';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      ...(type === 'register'
        ? {
            username: (value) => {
              if (!value) return 'Username is required';
              if (value.length < 3) return 'Username must be at least 3 characters';
              return null;
            },
            confirmPassword: (value, values) =>
              value !== values.password ? 'Passwords do not match' : null,
          }
        : {}),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack spacing="md">
        {type === 'register' && (
          <TextInput
            label="Username"
            placeholder="Your username"
            {...form.getInputProps('username')}
            disabled={loading}
            required
          />
        )}

        <TextInput
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps('email')}
          disabled={loading}
          required
        />

        <PasswordInput
          label="Password"
          placeholder="Your password"
          {...form.getInputProps('password')}
          disabled={loading}
          required
        />

        {type === 'register' && (
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            {...form.getInputProps('confirmPassword')}
            disabled={loading}
            required
          />
        )}

        <Group position="apart" mt="md">
          <Text size="sm">
            {type === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Link
              to={type === 'login' ? '/register' : '/login'}
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              {type === 'login' ? 'Register' : 'Login'}
            </Link>
          </Text>

          <LoadingButton type="submit" loading={loading}>
            {type === 'login' ? 'Sign in' : 'Create account'}
          </LoadingButton>
        </Group>
      </Stack>
    </form>
  );
} 