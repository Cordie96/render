import { Stack, Card, Text, Group, ActionIcon, Skeleton } from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { QueueItem } from '../types';

interface QueueListProps {
  queue: QueueItem[];
  currentItem: QueueItem | null;
  isHost: boolean;
  onRemove: (id: string) => Promise<void>;
  onReorder?: (sourceIndex: number, destinationIndex: number) => Promise<void>;
  loading?: boolean;
}

export default function QueueList({
  queue,
  currentItem,
  isHost,
  onRemove,
  onReorder,
  loading,
}: QueueListProps) {
  if (loading) {
    return (
      <Stack spacing="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={60} radius="md" />
        ))}
      </Stack>
    );
  }

  if (!queue.length && !currentItem) {
    return (
      <Text color="dimmed" align="center">
        No songs in queue
      </Text>
    );
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination || !onReorder) return;
    onReorder(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="queue">
        {(provided) => (
          <Stack spacing="md" ref={provided.innerRef} {...provided.droppableProps}>
            {currentItem && (
              <Card p="sm" withBorder>
                <Group position="apart">
                  <div>
                    <Text size="sm" weight={500}>
                      Now Playing: {currentItem.title}
                    </Text>
                    <Text size="xs" color="dimmed">
                      Added by {currentItem.addedBy}
                    </Text>
                  </div>
                </Group>
              </Card>
            )}

            {queue.map((item, index) => (
              <Draggable
                key={item.id}
                draggableId={item.id}
                index={index}
                isDragDisabled={!onReorder}
              >
                {(provided) => (
                  <Card
                    p="sm"
                    withBorder
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <Group position="apart">
                      {onReorder && (
                        <ActionIcon {...provided.dragHandleProps}>
                          <IconGripVertical size={16} />
                        </ActionIcon>
                      )}
                      <div style={{ flex: 1 }}>
                        <Text size="sm">{item.title}</Text>
                        <Text size="xs" color="dimmed">
                          Added by {item.addedBy}
                        </Text>
                      </div>
                      {(isHost || item.addedById === currentItem?.addedById) && (
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => onRemove(item.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
} 