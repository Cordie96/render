import { Group, Slider, ActionIcon, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';
import { formatDuration } from '../../utils/formatDuration';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  disabled?: boolean;
}

export default function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek,
  disabled = false,
}: PlayerControlsProps) {
  const theme = useMantineTheme();

  return (
    <Stack spacing="xs">
      <Group spacing="xs" noWrap>
        <ActionIcon
          variant="light"
          color={theme.primaryColor}
          size="lg"
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled}
          sx={{
            '&:hover:not(:disabled)': {
              backgroundColor: theme.fn.rgba(
                theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 9 : 1],
                0.35
              ),
            },
          }}
        >
          {isPlaying ? <IconPlayerPause size={20} /> : <IconPlayerPlay size={20} />}
        </ActionIcon>

        <Text size="sm" style={{ minWidth: 45 }}>
          {formatDuration(currentTime)}
        </Text>

        <Slider
          value={currentTime}
          onChange={onSeek}
          min={0}
          max={duration}
          disabled={disabled}
          style={{ flex: 1 }}
          styles={(theme) => ({
            track: {
              backgroundColor: theme.colorScheme === 'dark' 
                ? theme.colors.dark[4] 
                : theme.colors.gray[2],
            },
            bar: {
              backgroundColor: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 7 : 6],
            },
            thumb: {
              borderColor: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 7 : 6],
              backgroundColor: theme.white,
              '&:hover': {
                transform: 'scale(1.1)',
              },
            },
          })}
        />

        <Text size="sm" style={{ minWidth: 45 }}>
          {formatDuration(duration)}
        </Text>
      </Group>
    </Stack>
  );
} 