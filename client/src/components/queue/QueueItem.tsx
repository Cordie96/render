import { Card, Group, Text, ActionIcon, Badge, useMantineTheme } from '@mantine/core';
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
  const theme = useMantineTheme();

  return (
    <Card 
      p="sm"
      radius="md"
      style={{
        backgroundColor: isPlaying 
          ? theme.fn.rgba(theme.colors.blue[theme.colorScheme === 'dark' ? 9 : 0], 0.2)
          : theme.colorScheme === 'dark' 
            ? theme.colors.dark[6] 
            : theme.white,
      }}
    >
      <Group position="apart">
        <Group>
          {isDraggable && (
            <ActionIcon {...dragHandleProps} sx={{ cursor: 'grab' }}>
              <IconGripVertical size={16} />
            </ActionIcon>
          )}
          <div>
            <Text weight={500}>{item.title}</Text>
            {isPlaying && (
              <Badge 
                variant="filled" 
                color={theme.primaryColor}
                size="sm"
              >
                Now Playing
              </Badge>
            )}
          </div>
        </Group>

        {onRemove && (
          <ActionIcon 
            color="red" 
            variant="light" 
            onClick={onRemove}
            sx={{
              '&:hover': {
                backgroundColor: theme.fn.rgba(theme.colors.red[9], 0.15),
              },
            }}
          >
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>
    </Card>
  );
} 