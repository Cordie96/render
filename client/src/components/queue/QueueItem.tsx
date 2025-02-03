import { Card, Group, Text, ActionIcon, Badge } from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { QueueItem as QueueItemType } from '../../types';

interface QueueItemProps {
  item: QueueItemType;
  isPlaying?: boolean;
  isDraggable?: boolean;
  dragHandleProps?: any;
  onRemove?: () => void;
}

export default function QueueItem({
  item,
  isPlaying,
  isDraggable,
  dragHandleProps,
  onRemove,
}: QueueItemProps) {
  return (
    <Card p="sm" withBorder>
      <Group position="apart">
        {isDraggable && (
          <ActionIcon {...dragHandleProps}>
            <IconGripVertical size={16} />
          </ActionIcon>
        )}
        <div style={{ flex: 1 }}>
          <Group position="apart">
            <Text size="sm" weight={500} lineClamp={1}>
              {item.title}
            </Text>
            {isPlaying && (
              <Badge color="blue" size="sm">
                Now Playing
              </Badge>
            )}
          </Group>
          <Text size="xs" color="dimmed">
            Added by {item.addedBy}
          </Text>
        </div>
        {onRemove && (
          <ActionIcon color="red" variant="light" onClick={onRemove}>
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>
    </Card>
  );
} 