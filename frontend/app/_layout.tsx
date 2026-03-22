import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, Animated, Easing } from 'react-native';
import 'react-native-reanimated';
import '../global.css';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { AppThemeProvider, useAppTheme } from '../context/theme-context';
import { AuthProvider, useAuth } from '../context/auth-context';
import { LanguageProvider } from '../context/language-context';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import * as SystemUI from 'expo-system-ui';
import { StripeProvider } from '@stripe/stripe-react-native';

// Remove unstable_settings to let the router mount app/index.tsx neutrally

function LoadingScreen() {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const { isDark } = useAppTheme();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1.03],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity }}>
        <View style={{
          width: 88, height: 88, borderRadius: 28,
          backgroundColor: isDark ? '#1c1c1e' : '#f4f4f5',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          shadowColor: isDark ? '#000' : '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 16,
          elevation: 8
        }}>
          <Ionicons name="book" size={44} color={isDark ? "#ea580c" : "#f97316"} />
        </View>
        <Text style={{ fontSize: 28, fontWeight: '800', color: isDark ? '#ffffff' : '#111827', marginBottom: 8, letterSpacing: 0.5 }}>
          Sahifa
        </Text>
        <Text style={{ fontSize: 16, color: isDark ? '#a1a1aa' : '#6b7280', fontWeight: '500', letterSpacing: 0.2 }}>
          Elektron kutubxona
        </Text>
      </Animated.View>

      <View style={{ position: 'absolute', bottom: 80, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={isDark ? "#ea580c" : "#f97316"} style={{ marginBottom: 16 }} />
        <Text style={{ color: isDark ? '#71717a' : '#9ca3af', fontSize: 13, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Yuklanmoqda...
        </Text>
      </View>
    </View>
  );
}

function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { isDark } = useAppTheme();

  useEffect(() => {
    // Force system root background to prevent white status bar flashes
    SystemUI.setBackgroundColorAsync(isDark ? '#000000' : '#f3f4f6');

    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      // Bouncing back to tabs if authenticated person accidentally hits login
      router.replace('/(tabs)');
    }
    // We removed the else if block to let guests stay gracefully in the tabs space.
  }, [isLoading, isAuthenticated, segments, isDark]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: isDark ? '#000000' : '#f3f4f6' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="add-book" options={{ headerShown: false }} />
        <Stack.Screen name="book-detail" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="edit-books" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <Toast position="top" topOffset={50} visibilityTime={3000} />
    </>
  );
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { isDark, themeLoaded } = useAppTheme();

  if (!themeLoaded) return null;

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar hidden={true} translucent={true} />
      {children}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <StripeProvider publishableKey="pk_test_51TCOi3B76Wdvl5pO5K9eNsF9tyydHeY2ExpABI4Ni6riH64IVv03I5QPitHYyMIxk2U5Wv8sfO9pKGGvjRB9WFk4005Yg10PQr" urlScheme="ebooks">
      <AppThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <ThemeWrapper>
              <RootNavigator />
            </ThemeWrapper>
          </LanguageProvider>
        </AuthProvider>
      </AppThemeProvider>
    </StripeProvider>
  );
}
