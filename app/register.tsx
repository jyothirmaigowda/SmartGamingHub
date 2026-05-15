import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

export default function RegisterScreen() {
  const { register } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirm) {
      showAlert('Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await register(username.trim(), password);
    setLoading(false);
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      showAlert('Registration Failed', result.error || 'Could not create account.');
    }
  };

  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={s.back} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={s.header}>
            <Text style={s.logo}>🕹️</Text>
            <Text style={s.title}>JOIN THE HUB</Text>
            <Text style={s.subtitle}>Create your player account</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>NEW PLAYER REGISTRATION</Text>

            {[
              { label: 'USERNAME', value: username, setter: setUsername, icon: 'person', secure: false, placeholder: 'Choose a username' },
              { label: 'PASSWORD', value: password, setter: setPassword, icon: 'lock', secure: !showPw, placeholder: 'Create a password' },
              { label: 'CONFIRM PASSWORD', value: confirm, setter: setConfirm, icon: 'lock-outline', secure: !showPw, placeholder: 'Repeat your password' },
            ].map((field) => (
              <View key={field.label} style={s.inputGroup}>
                <Text style={s.label}>{field.label}</Text>
                <View style={s.inputWrap}>
                  <MaterialIcons name={field.icon as any} size={20} color={theme.colors.primary} />
                  <TextInput
                    style={s.input}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry={field.secure}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {field.label === 'PASSWORD' && (
                    <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                      <MaterialIcons name={showPw ? 'visibility-off' : 'visibility'} size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <View style={s.rules}>
              <Text style={s.ruleTitle}>Requirements:</Text>
              <Text style={s.ruleItem}>• Username: 3+ characters</Text>
              <Text style={s.ruleItem}>• Password: 4+ characters</Text>
              <Text style={s.ruleItem}>• No duplicate usernames</Text>
            </View>

            <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>⚡  CREATE ACCOUNT</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={s.loginLink} onPress={() => router.back()}>
              <Text style={s.loginLinkText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { flexGrow: 1, padding: 24 },
    back: { marginBottom: 16 },
    header: { alignItems: 'center', marginBottom: 32 },
    logo: { fontSize: 56, marginBottom: 12 },
    title: { fontSize: 26, fontWeight: '900', color: theme.colors.primary, letterSpacing: 3 },
    subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 6 },
    card: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      borderRadius: theme.borderRadius.lg,
      padding: 24,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: 2,
      marginBottom: 20,
      textAlign: 'center',
    },
    inputGroup: { marginBottom: 14 },
    label: { fontSize: 11, fontWeight: '700', color: theme.colors.primary, letterSpacing: 2, marginBottom: 6 },
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
    input: { flex: 1, color: theme.colors.text, fontSize: 16 },
    rules: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.borderRadius.sm,
      padding: 12,
      marginBottom: 16,
    },
    ruleTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.primary, marginBottom: 4 },
    ruleItem: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    btn: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 4,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
    loginLink: { alignItems: 'center', marginTop: 20 },
    loginLinkText: { color: theme.colors.secondary, fontSize: 14 },
  });
