import { useState } from 'react';
import { TextInput, PasswordInput, Button, Stack, Title, Text } from '@mantine/core';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <Stack sx={{ maxWidth: 400 }} mx="auto" mt="xl">
      <Title order={2}>Register</Title>
      {error && <Text color="red">{error}</Text>}
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            required
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextInput
            required
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            required
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Register</Button>
          <Text size="sm">
            Already have an account? <Link to="/login">Login</Link>
          </Text>
        </Stack>
      </form>
    </Stack>
  );
} 