import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

type SortKey = 'totalScore' | 'wins' | 'gamesPlayed';

export default function LeaderboardScreen() {
  const { allUsers, currentUser } = useAuth();
  const { theme } = useTheme();
  const [sortKey, setSortKey] = useState<SortKey>('totalScore');
  const s = makeStyles(theme);

  const sorted = [...allUsers].sort((a, b) => b[sortKey] - a[sortKey]);

  const MEDALS = ['🥇', '🥈', '🥉'];
  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'totalScore', label: 'SCORE' },
    { key: 'wins', label: 'WINS' },
    { key: 'gamesPlayed', label: 'PLAYED' },
  ];

  const renderPlayer = ({ item, index }: { item: any; index: number }) => {
    const isMe = item.username === currentUser?.username;
    return (
      <View style={[s.row, isMe && s.rowMe, index < 3 && s.rowTop]}>
        <Text style={s.rank}>{MEDALS[index] ?? `#${index + 1}`}</Text>
        <Text style={s.avatar}>{item.avatar}</Text>
        <View style={s.info}>
          <Text style={[s.name, isMe && { color: theme.colors.primary }]}>
            {item.username}{isMe ? '  (You)' : ''}
          </Text>
          <Text style={s.sub}>
            {item.wins}W · {item.losses}L · {item.gamesPlayed} games
          </Text>
        </View>
        <View style={s.scoreWrap}>
          <Text style={[s.score, index < 3 && { color: theme.colors.warning }]}>
            {sortKey === 'totalScore' ? item.totalScore : sortKey === 'wins' ? item.wins : item.gamesPlayed}
          </Text>
          <Text style={s.scoreLabel}>{SORTS.find((s) => s.key === sortKey)?.label}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>🏆  LEADERBOARD</Text>
        <Text style={s.subtitle}>{allUsers.length} Players Ranked</Text>
      </View>

      {/* Sort Options */}
      <View style={s.sortBar}>
        {SORTS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[s.sortBtn, sortKey === opt.key && s.sortBtnActive]}
            onPress={() => setSortKey(opt.key)}
            activeOpacity={0.8}
          >
            <Text style={[s.sortText, sortKey === opt.key && s.sortTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {allUsers.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🏅</Text>
          <Text style={s.emptyText}>No players yet.</Text>
          <Text style={s.emptySub}>Play games to appear on the leaderboard!</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.username}
          renderItem={renderPlayer}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={s.podium}>
              {sorted.slice(0, 3).map((p, i) => {
                const heights = [90, 70, 55];
                const orders = [1, 0, 2];
                const rankIndex = orders[i];
                return (
                  <View key={p.username} style={[s.podiumSlot, { order: rankIndex }]}>
                    <Text style={s.podiumAvatar}>{p.avatar}</Text>
                    <Text style={s.podiumMedal}>{MEDALS[rankIndex]}</Text>
                    <Text style={s.podiumName} numberOfLines={1}>{p.username}</Text>
                    <Text style={s.podiumScore}>{p.totalScore}</Text>
                    <View style={[s.podiumBar, { height: heights[rankIndex], backgroundColor: rankIndex === 0 ? '#FFD700' : rankIndex === 1 ? '#C0C0C0' : '#CD7F32' }]} />
                  </View>
                );
              })}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 16 },
    title: { fontSize: 20, fontWeight: '900', color: theme.colors.text, letterSpacing: 2 },
    subtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 },
    sortBar: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 10,
      marginBottom: 16,
    },
    sortBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      alignItems: 'center',
    },
    sortBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    sortText: { fontSize: 12, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1 },
    sortTextActive: { color: '#fff' },
    list: { paddingHorizontal: 16, paddingBottom: 24 },
    podium: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-end',
      marginBottom: 24,
      gap: 12,
      paddingVertical: 16,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    podiumSlot: { alignItems: 'center', flex: 1 },
    podiumAvatar: { fontSize: 28, marginBottom: 4 },
    podiumMedal: { fontSize: 20 },
    podiumName: { fontSize: 12, fontWeight: '700', color: theme.colors.text, marginTop: 4, maxWidth: 70, textAlign: 'center' },
    podiumScore: { fontSize: 16, fontWeight: '900', color: theme.colors.primary, marginTop: 2 },
    podiumBar: { width: '80%', borderTopLeftRadius: 4, borderTopRightRadius: 4, marginTop: 8 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      gap: 12,
    },
    rowMe: { borderColor: theme.colors.primary },
    rowTop: { borderColor: theme.colors.warning + '55' },
    rank: { fontSize: 20, width: 36, textAlign: 'center' },
    avatar: { fontSize: 24 },
    info: { flex: 1 },
    name: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    sub: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
    scoreWrap: { alignItems: 'flex-end' },
    score: { fontSize: 20, fontWeight: '900', color: theme.colors.text },
    scoreLabel: { fontSize: 10, color: theme.colors.textMuted, letterSpacing: 1 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyIcon: { fontSize: 60, marginBottom: 16 },
    emptyText: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    emptySub: { fontSize: 14, color: theme.colors.textMuted, marginTop: 8, textAlign: 'center' },
  });
