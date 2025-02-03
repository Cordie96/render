import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Title,
  Text,
  Container,
  Paper,
} from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useError } from '../hooks/useError';
import ErrorAlert from './ErrorAlert';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { error, handleError, clearError } = useError();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Stack spacing="lg">
          <Title order={2} align="center">Welcome Back</Title>

          {error && <ErrorAlert error={error} onClose={clearError} />}

          <form onSubmit={handleSubmit}>
            <Stack spacing="md">
              <TextInput
                required
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />

              <PasswordInput
                required
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />

              <Button type="submit" loading={loading}>
                Login
              </Button>
            </Stack>
          </form>

          <Text align="center" size="sm">
            Don't have an account?{' '}
            <Link to="/register">Register</Link>
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
} 