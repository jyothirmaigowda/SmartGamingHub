// Guess the Number Game
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { GameScreen } from '@/components/ui/GameScreen';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

type Diff = 'Easy' | 'Medium' | 'Hard';
const RANGES: Record<Diff, [number, number]> = {
  Easy: [1, 20], Medium: [1, 50], Hard: [1, 100],
};
const MAX_GUESSES: Record<Diff, number> = { Easy: 8, Medium: 7, Hard: 6 };

function generateSecret(diff: Diff) {
  const [lo, hi] = RANGES[diff];
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

export default function GuessNumber() {
  const { theme } = useTheme();
  const { addScore } = useAuth();
  const s = makeStyles(theme);

  const [diff, setDiff] = useState<Diff>('Medium');
  const [secret, setSecret] = useState(() => generateSecret('Medium'));
  const [input, setInput] = useState('');
  const [guesses, setGuesses] = useState<{ value: number; hint: string }[]>([]);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [score, setScore] = useState(0);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleGuess = () => {
    const n = parseInt(input.trim());
    const [lo, hi] = RANGES[diff];
    if (isNaN(n) || n < lo || n > hi) {
      shake();
      return;
    }
    let hint = '';
    if (n === secret) {
      hint = '🎯 Correct!';
      const pts = (MAX_GUESSES[diff] - guesses.length) * 10 + 20;
      setScore((p) => p + pts);
      setWon(true);
      addScore('Guess the Number', pts, true);
    } else if (n < secret) {
      const diff2 = secret - n;
      hint = diff2 > 10 ? '📈 Way too low!' : diff2 > 5 ? '⬆️ Too low' : '🔼 A bit low';
    } else {
      const diff2 = n - secret;
      hint = diff2 > 10 ? '📉 Way too high!' : diff2 > 5 ? '⬇️ Too high' : '🔽 A bit high';
    }
    const newGuesses = [...guesses, { value: n, hint }];
    setGuesses(newGuesses);
    setInput('');
    if (!won && newGuesses.length >= MAX_GUESSES[diff]) {
      setLost(true);
      addScore('Guess the Number', 0, false);
    }
  };

  const reset = (d: Diff = diff) => {
    setSecret(generateSecret(d));
    setGuesses([]);
    setInput('');
    setWon(false);
    setLost(false);
  };

  const remaining = MAX_GUESSES[diff] - guesses.length;
  const [lo, hi] = RANGES[diff];
  const diffColors: Record<Diff, string> = { Easy: theme.colors.success, Medium: theme.colors.warning, Hard: theme.colors.danger };

  return (
    <GameScreen title="Guess the Number" icon="🔢" score={score}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Difficulty */}
        <View style={s.diffRow}>
          {(['Easy','Medium','Hard'] as Diff[]).map((d) => (
            <TouchableOpacity
              key={d}
              style={[s.diffBtn, diff === d && { backgroundColor: diffColors[d] + '33', borderColor: diffColors[d] }]}
              onPress={() => { setDiff(d); reset(d); }}
            >
              <Text style={[s.diffText, { color: diff === d ? diffColors[d] : theme.colors.textMuted }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Card */}
        <View style={s.infoCard}>
          <Text style={s.infoText}>Guess a number between</Text>
          <Text style={s.infoRange}>{lo} — {hi}</Text>
          <Text style={[s.infoAttempts, { color: remaining <= 2 ? theme.colors.danger : theme.colors.textSecondary }]}>
            {remaining} guesses remaining
          </Text>
        </View>

        {/* Guess History */}
        {guesses.map((g, i) => (
          <View key={i} style={[s.guessRow, g.hint.includes('🎯') && s.guessWin]}>
            <Text style={s.guessNum}>#{i + 1}: {g.value}</Text>
            <Text style={s.guessHint}>{g.hint}</Text>
          </View>
        ))}

        {/* Win/Lose Banner */}
        {won && (
          <View style={[s.banner, { borderColor: theme.colors.success }]}>
            <Text style={[s.bannerText, { color: theme.colors.success }]}>
              🏆 Correct in {guesses.length} guesses!
            </Text>
          </View>
        )}
        {lost && (
          <View style={[s.banner, { borderColor: theme.colors.danger }]}>
            <Text style={[s.bannerText, { color: theme.colors.danger }]}>
              💀 The number was {secret}
            </Text>
          </View>
        )}

        {/* Input */}
        {!won && !lost && (
          <Animated.View style={[s.inputRow, { transform: [{ translateX: shakeAnim }] }]}>
            <TextInput
              style={s.input}
              value={input}
              onChangeText={setInput}
              placeholder={`${lo}–${hi}`}
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
              maxLength={3}
              onSubmitEditing={handleGuess}
            />
            <TouchableOpacity style={s.guessBtn} onPress={handleGuess} activeOpacity={0.8}>
              <Text style={s.guessBtnText}>GUESS</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {(won || lost) && (
          <TouchableOpacity style={s.resetBtn} onPress={() => reset()} activeOpacity={0.8}>
            <Text style={s.resetBtnText}>▶  PLAY AGAIN</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </GameScreen>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    diffRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    diffBtn: {
      flex: 1, paddingVertical: 10, borderRadius: 100,
      borderWidth: 1, borderColor: theme.colors.cardBorder,
      backgroundColor: theme.colors.card, alignItems: 'center',
    },
    diffText: { fontSize: 13, fontWeight: '700' },
    infoCard: {
      backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg,
      borderWidth: 1, borderColor: theme.colors.cardBorder,
      padding: 24, alignItems: 'center', marginBottom: 16,
    },
    infoText: { fontSize: 14, color: theme.colors.textMuted },
    infoRange: { fontSize: 32, fontWeight: '900', color: theme.colors.primary, marginTop: 6 },
    infoAttempts: { fontSize: 14, fontWeight: '700', marginTop: 8 },
    guessRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md,
      borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 12, marginBottom: 6,
    },
    guessWin: { borderColor: theme.colors.success },
    guessNum: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
    guessHint: { fontSize: 14, color: theme.colors.textSecondary },
    banner: {
      borderRadius: theme.borderRadius.md, borderWidth: 2,
      padding: 16, marginBottom: 16, alignItems: 'center',
      backgroundColor: theme.colors.card,
    },
    bannerText: { fontSize: 18, fontWeight: '900' },
    inputRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    input: {
      flex: 1, backgroundColor: theme.colors.inputBg, borderWidth: 1,
      borderColor: theme.colors.inputBorder, borderRadius: theme.borderRadius.md,
      paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 20, fontWeight: '700', color: theme.colors.text, textAlign: 'center',
    },
    guessBtn: {
      backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
      paddingHorizontal: 20, justifyContent: 'center',
    },
    guessBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
    resetBtn: {
      backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
      paddingVertical: 16, alignItems: 'center', marginTop: 8,
    },
    resetBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  });
