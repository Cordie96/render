import React from 'react';
import { Container, Paper, Title, Text, Button, Stack } from '@mantine/core';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container size="sm" py="xl">
          <Paper p="xl" radius="md" withBorder>
            <Stack spacing="lg" align="center">
              <Title order={2} color="red">
                Something went wrong
              </Title>
              <Text align="center" color="dimmed">
                {this.state.error?.message || 'An unexpected error occurred'}
              </Text>
              <Button onClick={this.handleReset}>Return to Home</Button>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
} 