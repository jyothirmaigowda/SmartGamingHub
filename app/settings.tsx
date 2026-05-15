import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { themes, ThemeKey } from '@/constants/theme';

export default function SettingsScreen() {
  const { theme, themeKey, setTheme } = useTheme();
  const router = useRouter();
  const s = makeStyles(theme);

  const themeList = Object.values(themes);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>SETTINGS</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>🎨  CHOOSE THEME</Text>
          <Text style={s.sectionSub}>Select your preferred visual style</Text>

          {themeList.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[s.themeCard, themeKey === t.key && { borderColor: t.colors.primary, borderWidth: 2 }]}
              onPress={() => setTheme(t.key as ThemeKey)}
              activeOpacity={0.8}
            >
              {/* Preview Strip */}
              <View style={s.themePreview}>
                <View style={[s.previewBg, { backgroundColor: t.colors.background }]}>
                  <View style={[s.previewCard, { backgroundColor: t.colors.card, borderColor: t.colors.cardBorder }]}>
                    <View style={[s.previewAccent, { backgroundColor: t.colors.primary }]} />
                    <View style={[s.previewLine, { backgroundColor: t.colors.text }]} />
                    <View style={[s.previewLine2, { backgroundColor: t.colors.textMuted }]} />
                  </View>
                </View>
              </View>

              <View style={s.themeInfo}>
                <View style={s.themeNameRow}>
                  <Text style={s.themeIcon}>{t.icon}</Text>
                  <Text style={s.themeName}>{t.name}</Text>
                </View>
                <View style={s.colorDots}>
                  {[t.colors.primary, t.colors.secondary, t.colors.accent, t.colors.success].map((c, i) => (
                    <View key={i} style={[s.dot, { backgroundColor: c }]} />
                  ))}
                </View>
              </View>

              {themeKey === t.key && (
                <MaterialIcons name="check-circle" size={24} color={t.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* About */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>ℹ️  ABOUT</Text>
          <View style={s.aboutCard}>
            <Text style={s.aboutTitle}>Smart Gaming Hub</Text>
            <Text style={s.aboutText}>Version 1.0.0</Text>
            <Text style={s.aboutText}>11 Games · 4 Themes · Full Player System</Text>
            <Text style={s.aboutText}>Built with React Native + Expo</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 14,
    },
    back: { padding: 4 },
    title: { fontSize: 20, fontWeight: '900', color: theme.colors.text, letterSpacing: 2 },
    section: { paddingHorizontal: 16, marginBottom: 28 },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.text, letterSpacing: 2, marginBottom: 4 },
    sectionSub: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 16 },
    themeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      borderRadius: theme.borderRadius.lg,
      marginBottom: 12,
      overflow: 'hidden',
      padding: 12,
      gap: 14,
    },
    themePreview: { width: 72, height: 56, borderRadius: 8, overflow: 'hidden' },
    previewBg: { flex: 1, padding: 6, justifyContent: 'center' },
    previewCard: { flex: 1, borderWidth: 1, borderRadius: 4, padding: 4 },
    previewAccent: { height: 6, borderRadius: 2, width: '60%', marginBottom: 4 },
    previewLine: { height: 3, borderRadius: 2, width: '90%', marginBottom: 3 },
    previewLine2: { height: 3, borderRadius: 2, width: '70%' },
    themeInfo: { flex: 1 },
    themeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    themeIcon: { fontSize: 18 },
    themeName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    colorDots: { flexDirection: 'row', gap: 6 },
    dot: { width: 14, height: 14, borderRadius: 7 },
    aboutCard: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      borderRadius: theme.borderRadius.lg,
      padding: 20,
      gap: 6,
    },
    aboutTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.primary, marginBottom: 4 },
    aboutText: { fontSize: 13, color: theme.colors.textSecondary },
  });
