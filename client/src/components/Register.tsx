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

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { error, handleError, clearError } = useError();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      handleError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/login');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Stack spacing="lg">
          <Title order={2} align="center">Create Account</Title>

          {error && <ErrorAlert error={error} onClose={clearError} />}

          <form onSubmit={handleSubmit}>
            <Stack spacing="md">
              <TextInput
                required
                label="Username"
                value={formData.username}
                onChange={handleChange('username')}
                placeholder="Choose a username"
              />

              <TextInput
                required
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="your@email.com"
              />

              <PasswordInput
                required
                label="Password"
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="Create a password"
              />

              <PasswordInput
                required
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="Confirm your password"
              />

              <Button type="submit" loading={loading}>
                Register
              </Button>
            </Stack>
          </form>

          <Text align="center" size="sm">
            Already have an account?{' '}
            <Link to="/login">Login</Link>
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
} 