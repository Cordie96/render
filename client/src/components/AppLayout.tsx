import { AppShell, Header, Group, Button, Title, ActionIcon } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} p="xs">
          <Group position="apart" px="md">
            <Title order={1} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              Party Karaoke
            </Title>
            <Group>
              <ActionIcon
                variant="default"
                onClick={toggleTheme}
                size={30}
              >
                {theme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
              </ActionIcon>
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