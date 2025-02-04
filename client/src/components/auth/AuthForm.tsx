import { TextInput, PasswordInput, Button, Stack, Text, Anchor, useMantineTheme } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';

interface AuthFormValues {
  email: string;
  password: string;
  username?: string;
}

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (values: AuthFormValues) => Promise<void>;
  loading?: boolean;
  error?: Error | null;
}

export default function AuthForm({ type, onSubmit, loading, error }: AuthFormProps) {
  const theme = useMantineTheme();
  const form = useForm<AuthFormValues>({
    initialValues: {
      email: '',
      password: '',
      ...(type === 'register' ? { username: '' } : {}),
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      ...(type === 'register' ? {
        username: (value) => (value && value.length >= 3 ? null : 'Username must be at least 3 characters'),
      } : {}),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack spacing="md">
        {type === 'register' && (
          <TextInput
            required
            label="Username"
            placeholder="Your username"
            {...form.getInputProps('username')}
            styles={(theme) => ({
              input: {
                '&:focus': {
                  borderColor: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 8 : 5],
                },
              },
            })}
          />
        )}

        <TextInput
          required
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps('email')}
          styles={(theme) => ({
            input: {
              '&:focus': {
                borderColor: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 8 : 5],
              },
            },
          })}
        />

        <PasswordInput
          required
          label="Password"
          placeholder="Your password"
          {...form.getInputProps('password')}
          styles={(theme) => ({
            input: {
              '&:focus': {
                borderColor: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 8 : 5],
              },
            },
          })}
        />

        <Button 
          type="submit" 
          loading={loading}
          fullWidth
          sx={(theme) => ({
            '&:hover': {
              backgroundColor: theme.fn.darken(
                theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 9 : 6],
                0.1
              ),
            },
          })}
        >
          {type === 'login' ? 'Sign in' : 'Create account'}
        </Button>

        <Text align="center" size="sm">
          {type === 'login' ? (
            <>
              Don't have an account?{' '}
              <Anchor component={Link} to="/register" size="sm">
                Register
              </Anchor>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Anchor component={Link} to="/login" size="sm">
                Login
              </Anchor>
            </>
          )}
        </Text>
      </Stack>
    </form>
  );
} 