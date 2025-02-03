import { AppShell, Header, Group, Button, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
              {user ? (
                <>
                  <Button variant="subtle" onClick={() => navigate('/create')}>
                    Create Room
                  </Button>
                  <Button variant="light" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="subtle" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button variant="light" onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </>
              )}
            </Group>
          </Group>
        </Header>
      }
    >
      {children}
    </AppShell>
  );
} 