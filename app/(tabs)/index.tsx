import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { GAMES } from '@/constants/games';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const s = makeStyles(theme, width);

  const topGames = GAMES.slice(0, 4);
  const recentGame = currentUser?.lastPlayedGame !== 'None'
    ? GAMES.find((g) => g.name === currentUser?.lastPlayedGame)
    : null;

  const stats = [
    { label: 'TOTAL SCORE', value: currentUser?.totalScore ?? 0, icon: 'star', color: theme.colors.warning },
    { label: 'GAMES PLAYED', value: currentUser?.gamesPlayed ?? 0, icon: 'sports-esports', color: theme.colors.secondary },
    { label: 'WINS', value: currentUser?.wins ?? 0, icon: 'emoji-events', color: theme.colors.success },
    { label: 'HIGH SCORE', value: currentUser?.highestScore ?? 0, icon: 'trending-up', color: theme.colors.primary },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Image
            source={require('@/assets/images/hero-banner.png')}
            style={s.heroBg}
            contentFit="cover"
            transition={300}
          />
          <View style={s.heroOverlay} />
          <View style={s.heroContent}>
            <Text style={s.greeting}>
              Welcome back, {currentUser?.avatar}
            </Text>
            <Text style={s.playerName}>{currentUser?.username?.toUpperCase()}</Text>
            <Text style={s.heroSub}>Ready to dominate the leaderboard?</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📊  YOUR STATS</Text>
          <View style={s.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.label} style={s.statCard}>
                <MaterialIcons name={stat.icon as any} size={24} color={stat.color} />
                <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Play */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>⚡  QUICK PLAY</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/games')}>
              <Text style={s.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          <View style={s.gamesRow}>
            {topGames.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={s.quickCard}
                onPress={() => router.push(game.route as any)}
                activeOpacity={0.75}
              >
                <Text style={s.quickCardIcon}>{game.icon}</Text>
                <Text style={s.quickCardName}>{game.shortName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Last Played */}
        {recentGame && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🕹️  CONTINUE PLAYING</Text>
            <TouchableOpacity
              style={s.continueCard}
              onPress={() => router.push(recentGame.route as any)}
              activeOpacity={0.8}
            >
              <Text style={s.continueIcon}>{recentGame.icon}</Text>
              <View style={s.continueInfo}>
                <Text style={s.continueName}>{recentGame.name}</Text>
                <Text style={s.continueSub}>Last played · Tap to resume</Text>
              </View>
              <MaterialIcons name="play-arrow" size={32} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Achievements */}
        {(currentUser?.achievements?.length ?? 0) > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🏆  ACHIEVEMENTS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.achieveRow}>
                {currentUser?.achievements.map((ach, i) => (
                  <View key={i} style={s.achieveBadge}>
                    <Text style={s.achieveIcon}>🏅</Text>
                    <Text style={s.achieveText}>{ach}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Theme & Settings Row */}
        <View style={s.section}>
          <TouchableOpacity
            style={s.settingsBtn}
            onPress={() => router.push('/settings')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="palette" size={22} color={theme.colors.primary} />
            <Text style={s.settingsBtnText}>CHANGE THEME & SETTINGS</Text>
            <MaterialIcons name="chevron-right" size={22} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any, width: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    hero: { height: 200, position: 'relative', marginHorizontal: 16, marginTop: 12, borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
    heroBg: { position: 'absolute', width: '100%', height: '100%' },
    heroOverlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.55)' },
    heroContent: { flex: 1, justifyContent: 'center', padding: 20 },
    greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
    playerName: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 2, marginTop: 4 },
    heroSub: { fontSize: 13, color: theme.colors.primary, marginTop: 6, letterSpacing: 1 },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.text, letterSpacing: 2, marginBottom: 12 },
    seeAll: { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statCard: {
      width: (width - 52) / 2,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      borderRadius: theme.borderRadius.md,
      padding: 16,
      alignItems: 'center',
      gap: 6,
    },
    statValue: { fontSize: 24, fontWeight: '900' },
    statLabel: { fontSize: 10, color: theme.colors.textMuted, fontWeight: '700', letterSpacing: 1 },
    gamesRow: { flexDirection: 'row', gap: 10 },
    quickCard: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      borderRadius: theme.borderRadius.md,
      padding: 14,
      alignItems: 'center',
      gap: 8,
    },
    quickCardIcon: { fontSize: 28 },
    quickCardName: { fontSize: 10, fontWeight: '700', color: theme.colors.textSecondary, letterSpacing: 1, textAlign: 'center' },
    continueCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: 16,
      gap: 14,
    },
    continueIcon: { fontSize: 36 },
    continueInfo: { flex: 1 },
    continueName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
    continueSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
    achieveRow: { flexDirection: 'row', gap: 10 },
    achieveBadge: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.warning,
      borderRadius: theme.borderRadius.md,
      padding: 12,
      alignItems: 'center',
      minWidth: 90,
    },
    achieveIcon: { fontSize: 24 },
    achieveText: { fontSize: 10, color: theme.colors.warning, fontWeight: '700', marginTop: 4, textAlign: 'center' },
    settingsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      borderRadius: theme.borderRadius.md,
      padding: 16,
      gap: 12,
    },
    settingsBtnText: { flex: 1, fontSize: 13, fontWeight: '700', color: theme.colors.text, letterSpacing: 1 },
  });
