import { Container, Paper, Title, Stack, useMantineTheme } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useFormSubmit } from '../hooks/useFormSubmit';
import AuthForm from '../components/auth/AuthForm';
import ErrorAlert from '../components/ErrorAlert';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
}

export default function RegisterScreen() {
  const theme = useMantineTheme();
  const { register } = useAuth();

  const { loading, error, handleSubmit } = useFormSubmit({
    onSubmit: async (values: RegisterFormValues) => {
      await register(values.username, values.email, values.password);
    },
  });

  return (
    <Container size="xs" py="xl">
      <Paper 
        radius="md" 
        p="xl"
        style={{
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
        }}
      >
        <Stack spacing="lg">
          <Title order={2} align="center">Create an account</Title>

          {error && <ErrorAlert error={error} />}

          <AuthForm
            type="register"
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </Stack>
      </Paper>
    </Container>
  );
} 