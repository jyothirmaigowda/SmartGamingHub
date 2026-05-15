import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/template';

export default function LoginScreen() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      shake();
      showAlert('Login Failed', result.error || 'Invalid credentials.');
    }
  };

  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.logo}>🎮</Text>
            <Text style={s.title}>SMART GAMING HUB</Text>
            <Text style={s.subtitle}>Sign in to continue your journey</Text>
          </View>

          <Animated.View style={[s.card, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={s.cardTitle}>PLAYER LOGIN</Text>

            <View style={s.inputGroup}>
              <Text style={s.label}>USERNAME</Text>
              <View style={s.inputWrap}>
                <MaterialIcons name="person" size={20} color={theme.colors.primary} />
                <TextInput
                  style={s.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>PASSWORD</Text>
              <View style={s.inputWrap}>
                <MaterialIcons name="lock" size={20} color={theme.colors.primary} />
                <TextInput
                  style={s.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                  <MaterialIcons
                    name={showPw ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={s.loginBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.loginBtnText}>▶  ENTER HUB</Text>
              )}
            </TouchableOpacity>

            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>NEW PLAYER?</Text>
              <View style={s.dividerLine} />
            </View>

            <TouchableOpacity
              style={s.registerBtn}
              onPress={() => router.push('/register')}
              activeOpacity={0.8}
            >
              <Text style={s.registerBtnText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={s.version}>Smart Gaming Hub v1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 40 },
    logo: { fontSize: 64, marginBottom: 12 },
    title: {
      fontSize: 26,
      fontWeight: '900',
      color: theme.colors.primary,
      letterSpacing: 3,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 6,
      letterSpacing: 1,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      borderRadius: theme.borderRadius.lg,
      padding: 24,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: 2,
      marginBottom: 24,
      textAlign: 'center',
    },
    inputGroup: { marginBottom: 16 },
    label: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 2,
      marginBottom: 8,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    input: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 16,
    },
    loginBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    loginBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 2,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
      gap: 12,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.cardBorder },
    dividerText: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 1 },
    registerBtn: {
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 14,
      alignItems: 'center',
    },
    registerBtnText: {
      color: theme.colors.primary,
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 2,
    },
    version: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 32 },
  });
