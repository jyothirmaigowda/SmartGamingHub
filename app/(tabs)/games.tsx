import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { GAMES } from '@/constants/games';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CATEGORIES = ['All', 'Strategy', 'Puzzle', 'Knowledge', 'Memory', 'Word', 'Skill', 'Arcade', 'Math', 'Reflex'];

export default function GamesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState('All');
  const s = makeStyles(theme);

  const filtered = selectedCat === 'All' ? GAMES : GAMES.filter((g) => g.category === selectedCat);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>🎮  GAME LIBRARY</Text>
        <Text style={s.subtitle}>{GAMES.length} Games Available</Text>
      </View>

      {/* Category Filter */}
      <View style={s.catBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[s.catChip, selectedCat === cat && s.catChipActive]}
              onPress={() => setSelectedCat(cat)}
              activeOpacity={0.75}
            >
              <Text style={[s.catText, selectedCat === cat && s.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.card, { borderColor: item.color + '55' }]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.8}
          >
            <View style={[s.cardTop, { backgroundColor: item.color + '22' }]}>
              <Text style={s.cardIcon}>{item.icon}</Text>
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardName}>{item.name}</Text>
              <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text>
              <View style={s.cardMeta}>
                <View style={[s.diffBadge, { backgroundColor: item.color + '33', borderColor: item.color + '66' }]}>
                  <Text style={[s.diffText, { color: item.color }]}>{item.difficulty}</Text>
                </View>
                <Text style={s.catBadge}>{item.category}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 12 },
    title: { fontSize: 20, fontWeight: '900', color: theme.colors.text, letterSpacing: 2 },
    subtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 },
    catBar: { marginBottom: 4 },
    catScroll: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
    catChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 100,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    catChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    catText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
    catTextActive: { color: '#fff' },
    list: { paddingHorizontal: 16, paddingBottom: 24 },
    row: { gap: 16, marginBottom: 16 },
    card: {
      width: CARD_WIDTH,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    cardTop: { padding: 20, alignItems: 'center' },
    cardIcon: { fontSize: 40 },
    cardBody: { padding: 12 },
    cardName: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
    cardDesc: { fontSize: 11, color: theme.colors.textMuted, lineHeight: 16, marginBottom: 8 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    diffBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 100,
      borderWidth: 1,
    },
    diffText: { fontSize: 10, fontWeight: '700' },
    catBadge: { fontSize: 10, color: theme.colors.textMuted },
  });
