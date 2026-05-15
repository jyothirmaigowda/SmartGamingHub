import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  title: string;
  icon: string;
  score?: number;
  children: ReactNode;
  scrollable?: boolean;
}

export function GameScreen({ title, icon, score, children, scrollable = true }: Props) {
  const { theme } = useTheme();
  const router = useRouter();
  const s = makeStyles(theme);

  const Wrapper = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.icon}>{icon}</Text>
        <Text style={s.title}>{title}</Text>
        {score !== undefined && (
          <View style={s.scoreBadge}>
            <Text style={s.scoreText}>{score}</Text>
          </View>
        )}
      </View>
      <Wrapper
        style={{ flex: 1 }}
        contentContainerStyle={scrollable ? s.content : undefined}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Wrapper>
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
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.cardBorder,
      gap: 10,
    },
    back: { marginRight: 4 },
    icon: { fontSize: 22 },
    title: { flex: 1, fontSize: 17, fontWeight: '800', color: theme.colors.text, letterSpacing: 1 },
    scoreBadge: {
      backgroundColor: theme.colors.primary + '33',
      borderRadius: 100,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    scoreText: { fontSize: 14, fontWeight: '900', color: theme.colors.primary },
    content: { padding: 16, paddingBottom: 40 },
  });
