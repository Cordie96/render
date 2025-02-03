import { Paper, Stack, Text, ActionIcon, Group } from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { QueueItem } from '../../types';

interface QueueListProps {
  items: QueueItem[];
  currentItem?: QueueItem;
  loading?: boolean;
  canReorder?: boolean;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onRemove?: (itemId: string) => void;
}

export default function QueueList({
  items,
  currentItem,
  loading,
  canReorder,
  onReorder,
  onRemove,
}: QueueListProps) {
  if (loading) {
    return <Text>Loading queue...</Text>;
  }

  if (items.length === 0 && !currentItem) {
    return <Text>Queue is empty</Text>;
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination || !onReorder) return;

    const fromIndex = result.source.index;
    const toIndex = result.destination.index;

    if (fromIndex === toIndex) return;

    onReorder(fromIndex, toIndex);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="queue">
        {(provided) => (
          <Stack spacing="xs" ref={provided.innerRef} {...provided.droppableProps}>
            {currentItem && (
              <Paper p="sm" withBorder>
                <Group position="apart">
                  <div>
                    <Text size="sm" weight={500}>
                      Now Playing
                    </Text>
                    <Text size="sm">{currentItem.title}</Text>
                  </div>
                </Group>
              </Paper>
            )}

            {items.map((item, index) => (
              <Draggable
                key={item.id}
                draggableId={item.id}
                index={index}
                isDragDisabled={!canReorder}
              >
                {(provided) => (
                  <Paper
                    p="sm"
                    withBorder
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <Group position="apart" spacing="xs">
                      <Group spacing="sm">
                        {canReorder && (
                          <ActionIcon {...provided.dragHandleProps}>
                            <IconGripVertical size={16} />
                          </ActionIcon>
                        )}
                        <Text size="sm">{item.title}</Text>
                      </Group>
                      {onRemove && (
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => onRemove(item.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Paper>
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