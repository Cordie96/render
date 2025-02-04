import { Modal as MantineModal, ModalProps, useMantineTheme } from '@mantine/core';

interface BaseModalProps extends Omit<ModalProps, 'styles'> {
  customStyles?: ModalProps['styles'];
}

export default function BaseModal({ 
  children, 
  customStyles,
  ...props 
}: BaseModalProps) {
  const theme = useMantineTheme();

  return (
    <MantineModal
      centered
      styles={(theme) => ({
        modal: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
        },
        header: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
          borderBottom: `1px solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
          }`,
        },
        title: {
          color: theme.colorScheme === 'dark' ? theme.white : theme.black,
          fontWeight: 600,
        },
        close: {
          color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
          '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' 
              ? theme.colors.dark[6] 
              : theme.colors.gray[1],
          },
        },
        ...customStyles,
      })}
      {...props}
    >
      {children}
    </MantineModal>
  );
} 