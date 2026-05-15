import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="games/rps" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="games/tictactoe" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="games/guessnumber" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="games/quiz" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="games/memory" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="games/wordscramble" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="games/typingtest" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="games/snake" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="games/magicsquare" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="games/moviequiz" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="games/colormatch" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom' }} />
            </Stack>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
