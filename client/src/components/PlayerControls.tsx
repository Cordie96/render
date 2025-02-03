import { Group, Slider, ActionIcon, Text } from '@mantine/core';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';

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
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Group spacing="md">
      <ActionIcon
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        variant="light"
        size="lg"
      >
        {isPlaying ? <IconPlayerPause size={20} /> : <IconPlayerPlay size={20} />}
      </ActionIcon>

      <Text size="sm" style={{ minWidth: 45 }}>
        {formatTime(currentTime)}
      </Text>

      <Slider
        value={currentTime}
        onChange={onSeek}
        min={0}
        max={duration}
        disabled={disabled}
        style={{ flex: 1 }}
      />

      <Text size="sm" style={{ minWidth: 45 }}>
        {formatTime(duration)}
      </Text>
    </Group>
  );
} 