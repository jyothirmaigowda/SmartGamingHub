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
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { GAMES } from '@/constants/games';
import { useAlert } from '@/template';

export default function ProfileScreen() {
  const { currentUser, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { showAlert } = useAlert();
  const s = makeStyles(theme);

  const handleLogout = () => {
    showAlert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  if (!currentUser) return null;

  const winRate = currentUser.gamesPlayed > 0
    ? Math.round((currentUser.wins / currentUser.gamesPlayed) * 100)
    : 0;

  const topGames = Object.entries(currentUser.gameStats)
    .sort(([, a], [, b]) => b.bestScore - a.bestScore)
    .slice(0, 5);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={s.profileCard}>
          <Text style={s.avatar}>{currentUser.avatar}</Text>
          <Text style={s.username}>{currentUser.username}</Text>
          <Text style={s.joined}>Member since {new Date(currentUser.createdAt).toLocaleDateString()}</Text>
          <View style={s.winRateWrap}>
            <View style={s.winRateBar}>
              <View style={[s.winRateFill, { width: `${winRate}%` as any }]} />
            </View>
            <Text style={s.winRateText}>{winRate}% Win Rate</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📊  STATISTICS</Text>
          <View style={s.grid}>
            {[
              { label: 'Total Score', value: currentUser.totalScore, icon: '⭐' },
              { label: 'Games Played', value: currentUser.gamesPlayed, icon: '🎮' },
              { label: 'Wins', value: currentUser.wins, icon: '🏆' },
              { label: 'Losses', value: currentUser.losses, icon: '💀' },
              { label: 'Draws', value: currentUser.draws, icon: '🤝' },
              { label: 'Best Score', value: currentUser.highestScore, icon: '🔥' },
            ].map((stat) => (
              <View key={stat.label} style={s.statCard}>
                <Text style={s.statIcon}>{stat.icon}</Text>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Last Played */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🕹️  LAST PLAYED</Text>
          <View style={s.infoRow}>
            <MaterialIcons name="sports-esports" size={20} color={theme.colors.primary} />
            <Text style={s.infoText}>{currentUser.lastPlayedGame}</Text>
          </View>
        </View>

        {/* Game History */}
        {topGames.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🎯  TOP PERFORMANCES</Text>
            {topGames.map(([gameId, stats]) => {
              const game = GAMES.find((g) => g.id === gameId || g.name === gameId);
              return (
                <View key={gameId} style={s.gameRow}>
                  <Text style={s.gameIcon}>{game?.icon ?? '🎮'}</Text>
                  <View style={s.gameInfo}>
                    <Text style={s.gameName}>{game?.name ?? gameId}</Text>
                    <Text style={s.gameSub}>{stats.played} played · {stats.wins} wins</Text>
                  </View>
                  <Text style={s.gameBest}>Best: {stats.bestScore}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Achievements */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🏅  ACHIEVEMENTS</Text>
          {currentUser.achievements.length === 0 ? (
            <View style={s.emptyAch}>
              <Text style={s.emptyAchText}>Play games to unlock achievements!</Text>
            </View>
          ) : (
            <View style={s.achGrid}>
              {currentUser.achievements.map((ach, i) => (
                <View key={i} style={s.achBadge}>
                  <Text style={s.achIcon}>🏅</Text>
                  <Text style={s.achName}>{ach}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={s.section}>
          <TouchableOpacity style={s.settingsBtn} onPress={() => router.push('/settings')} activeOpacity={0.8}>
            <MaterialIcons name="settings" size={22} color={theme.colors.text} />
            <Text style={s.settingsBtnText}>Settings & Themes</Text>
            <MaterialIcons name="chevron-right" size={22} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <MaterialIcons name="logout" size={22} color={theme.colors.danger} />
            <Text style={s.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    profileCard: {
      margin: 16,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      borderRadius: theme.borderRadius.lg,
      padding: 24,
      alignItems: 'center',
    },
    avatar: { fontSize: 64, marginBottom: 12 },
    username: { fontSize: 24, fontWeight: '900', color: theme.colors.text, letterSpacing: 2 },
    joined: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
    winRateWrap: { width: '100%', marginTop: 16 },
    winRateBar: { height: 6, backgroundColor: theme.colors.surface, borderRadius: 3, overflow: 'hidden' },
    winRateFill: { height: '100%', backgroundColor: theme.colors.success, borderRadius: 3 },
    winRateText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 6, textAlign: 'center' },
    section: { paddingHorizontal: 16, marginBottom: 24 },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.text, letterSpacing: 2, marginBottom: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statCard: {
      flex: 1,
      minWidth: '30%',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: 12,
      alignItems: 'center',
      gap: 4,
    },
    statIcon: { fontSize: 20 },
    statValue: { fontSize: 20, fontWeight: '900', color: theme.colors.primary },
    statLabel: { fontSize: 10, color: theme.colors.textMuted, textAlign: 'center' },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: 14,
      gap: 12,
    },
    infoText: { fontSize: 15, color: theme.colors.text, fontWeight: '600' },
    gameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: 12,
      marginBottom: 8,
      gap: 12,
    },
    gameIcon: { fontSize: 24 },
    gameInfo: { flex: 1 },
    gameName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
    gameSub: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
    gameBest: { fontSize: 13, fontWeight: '700', color: theme.colors.warning },
    emptyAch: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: 20,
      alignItems: 'center',
    },
    emptyAchText: { color: theme.colors.textMuted, fontSize: 14 },
    achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    achBadge: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.warning,
      borderRadius: theme.borderRadius.md,
      padding: 12,
      alignItems: 'center',
      minWidth: 90,
    },
    achIcon: { fontSize: 24 },
    achName: { fontSize: 11, color: theme.colors.warning, fontWeight: '700', marginTop: 4, textAlign: 'center' },
    settingsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: 16,
      gap: 12,
      marginBottom: 10,
    },
    settingsBtnText: { flex: 1, fontSize: 15, color: theme.colors.text, fontWeight: '600' },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.danger + '55',
      padding: 16,
      gap: 10,
    },
    logoutBtnText: { fontSize: 15, color: theme.colors.danger, fontWeight: '700' },
  });
