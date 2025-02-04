import { useState } from 'react';
import { Container, Title, Text, Button, Stack, Group, Paper, useMantineTheme } from '@mantine/core';
import { IconPlus, IconDoorEnter } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import CreateRoomModal from '../components/modals/CreateRoomModal';
import JoinRoomModal from '../components/modals/JoinRoomModal';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [joinModalOpened, setJoinModalOpened] = useState(false);
  const theme = useMantineTheme();
  const { user } = useAuth();

  return (
    <Container size="sm" py="xl">
      <Stack spacing="xl">
        <Stack spacing="xs">
          <Title order={1} align="center">
            Welcome{user ? `, ${user.username}` : ''}!
          </Title>
          <Text align="center" color="dimmed" size="lg">
            Create a room to start sharing music with friends
          </Text>
        </Stack>

        <Paper
          p="xl"
          radius="md"
          style={{
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
          }}
        >
          <Stack spacing="md">
            <Group grow>
              <Button
                size="lg"
                leftIcon={<IconPlus size={20} />}
                onClick={() => setCreateModalOpened(true)}
              >
                Create Room
              </Button>
              <Button
                size="lg"
                variant="light"
                leftIcon={<IconDoorEnter size={20} />}
                onClick={() => setJoinModalOpened(true)}
              >
                Join Room
              </Button>
            </Group>
          </Stack>
        </Paper>

        <CreateRoomModal
          opened={createModalOpened}
          onClose={() => setCreateModalOpened(false)}
        />

        <JoinRoomModal
          opened={joinModalOpened}
          onClose={() => setJoinModalOpened(false)}
        />
      </Stack>
    </Container>
  );
} 