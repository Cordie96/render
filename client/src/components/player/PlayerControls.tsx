import { Group, Slider, ActionIcon, Stack } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';
import { formatDuration } from '../../utils/formatters';

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
  disabled,
}: PlayerControlsProps) {
  return (
    <Stack spacing="xs">
      <Group position="center">
        <ActionIcon
          size="lg"
          variant="light"
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled}
        >
          {isPlaying ? (
            <IconPlayerPause size={20} />
          ) : (
            <IconPlayerPlay size={20} />
          )}
        </ActionIcon>
      </Group>

      <Group spacing="xs" noWrap>
        <Slider
          value={currentTime}
          onChange={onSeek}
          min={0}
          max={duration}
          disabled={disabled}
          label={formatDuration}
          style={{ flex: 1 }}
        />
      </Group>
    </Stack>
  );
} 