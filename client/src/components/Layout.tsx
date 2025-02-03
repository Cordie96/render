import { AppShell, Header, Group, Button, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingButton from './LoadingButton';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} p="xs">
          <Group position="apart">
            <Title order={3} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              Party Karaoke
            </Title>
            <Group>
              <Button variant="subtle" onClick={() => navigate('/')}>
                Rooms
              </Button>
              <Button variant="subtle" onClick={() => navigate('/create')}>
                Create Room
              </Button>
              <LoadingButton
                variant="subtle"
                color="red"
                onClick={handleLogout}
                loading={loggingOut}
              >
                Logout
              </LoadingButton>
            </Group>
          </Group>
        </Header>
      }
    >
      {children}
    </AppShell>
  );
} 