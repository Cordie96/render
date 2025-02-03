import { useState } from 'react';
import { TextInput, PasswordInput, Button, Stack, Title, Text } from '@mantine/core';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <Stack sx={{ maxWidth: 400 }} mx="auto" mt="xl">
      <Title order={2}>Login</Title>
      {error && <Text color="red">{error}</Text>}
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            required
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            required
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Login</Button>
          <Text size="sm">
            Don't have an account? <Link to="/register">Register</Link>
          </Text>
        </Stack>
      </form>
    </Stack>
  );
} 