import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RoomScreen from './screens/RoomScreen';
import RemoteScreen from './screens/RemoteScreen';
import RoomList from './components/RoomList';
import RoomCreation from './screens/RoomCreation';

export default function App() {
  return (
    <ErrorBoundary>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Notifications position="top-right" />
        <Router>
          <AuthProvider>
            <SocketProvider>
              <AppLayout>
                <Routes>
                  <Route path="/login" element={<LoginScreen />} />
                  <Route path="/register" element={<RegisterScreen />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <RoomList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create"
                    element={
                      <ProtectedRoute>
                        <RoomCreation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/screen/:roomId"
                    element={
                      <ProtectedRoute>
                        <RoomScreen />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/remote/:roomId"
                    element={
                      <ProtectedRoute>
                        <RemoteScreen />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AppLayout>
            </SocketProvider>
          </AuthProvider>
        </Router>
      </MantineProvider>
    </ErrorBoundary>
  );
} 