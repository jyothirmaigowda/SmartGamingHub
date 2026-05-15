// Word Scramble / Anagram Game
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { GameScreen } from '@/components/ui/GameScreen';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

const WORDS = [
  { word: 'PYTHON', hint: 'A programming language' },
  { word: 'GALAXY', hint: 'A system of stars' },
  { word: 'PUZZLE', hint: 'A brain teaser' },
  { word: 'BRIDGE', hint: 'Structure over water' },
  { word: 'JUNGLE', hint: 'Dense tropical forest' },
  { word: 'CASTLE', hint: 'Medieval fortress' },
  { word: 'FLIGHT', hint: 'Air travel' },
  { word: 'GARDEN', hint: 'Plants grow here' },
  { word: 'MIRROR', hint: 'Reflection surface' },
  { word: 'ORANGE', hint: 'Citrus fruit' },
  { word: 'PLANET', hint: 'Orbits a star' },
  { word: 'ROCKET', hint: 'Space vehicle' },
  { word: 'TROPHY', hint: 'Sports award' },
  { word: 'VIOLIN', hint: 'Stringed instrument' },
  { word: 'ZOMBIE', hint: 'Undead creature' },
];

function scramble(word: string): string {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join('');
  return result === word ? scramble(word) : result;
}

const TIME = 30;

export default function WordScramble() {
  const { theme } = useTheme();
  const { addScore } = useAuth();
  const s = makeStyles(theme);

  const [wordIdx, setWordIdx] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [round, setRound] = useState(0);
  const [skips, setSkips] = useState(3);
  const timerRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const currentWord = WORDS[wordIdx % WORDS.length];

  useEffect(() => {
    setScrambled(scramble(currentWord.word));
    setInput('');
    setSolved(false);
    setShowHint(false);
    setTimeLeft(TIME);
  }, [wordIdx]);

  useEffect(() => {
    if (solved) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          nextWord(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [wordIdx, solved]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const checkAnswer = () => {
    if (input.trim().toUpperCase() === currentWord.word) {
      clearInterval(timerRef.current);
      const pts = 20 + (showHint ? 0 : 10) + Math.floor(timeLeft * 0.5);
      setScore((s) => s + pts);
      setSolved(true);
      addScore('Word Scramble', pts, true);
    } else {
      shake();
      setInput('');
    }
  };

  const nextWord = (earned: boolean) => {
    clearInterval(timerRef.current);
    setWordIdx((i) => i + 1);
    setRound((r) => r + 1);
  };

  const skipWord = () => {
    if (skips <= 0) return;
    setSkips((s) => s - 1);
    nextWord(false);
  };

  return (
    <GameScreen title="Word Scramble" icon="🔤" score={score}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statLabel}>ROUND</Text>
            <Text style={s.statVal}>{round + 1}</Text>
          </View>
          <View style={[s.statBox, { borderColor: timeLeft <= 8 ? theme.colors.danger : theme.colors.cardBorder }]}>
            <Text style={[s.statLabel, { color: timeLeft <= 8 ? theme.colors.danger : theme.colors.textMuted }]}>TIME</Text>
            <Text style={[s.statVal, { color: timeLeft <= 8 ? theme.colors.danger : theme.colors.text }]}>{timeLeft}s</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>SKIPS</Text>
            <Text style={s.statVal}>{skips}</Text>
          </View>
        </View>

        {/* Scrambled Word */}
        <View style={s.scrambledCard}>
          <Text style={s.scrambleLabel}>Unscramble this word:</Text>
          <View style={s.lettersRow}>
            {scrambled.split('').map((ch, i) => (
              <View key={i} style={s.letterBox}>
                <Text style={s.letterText}>{ch}</Text>
              </View>
            ))}
          </View>
          <Text style={s.wordLen}>{currentWord.word.length} letters</Text>
        </View>

        {/* Hint */}
        {showHint ? (
          <View style={s.hintBox}>
            <Text style={s.hintText}>💡 Hint: {currentWord.hint}</Text>
          </View>
        ) : (
          <TouchableOpacity style={s.hintBtn} onPress={() => setShowHint(true)}>
            <Text style={s.hintBtnText}>💡 Show Hint (-10 pts)</Text>
          </TouchableOpacity>
        )}

        {/* Solved */}
        {solved ? (
          <View style={[s.solvedBanner]}>
            <Text style={s.solvedText}>✅ {currentWord.word} — Correct!</Text>
          </View>
        ) : (
          <Animated.View style={[s.inputRow, { transform: [{ translateX: shakeAnim }] }]}>
            <TextInput
              style={s.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your answer..."
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              onSubmitEditing={checkAnswer}
            />
          </Animated.View>
        )}

        <View style={s.btnRow}>
          {!solved && (
            <TouchableOpacity style={s.checkBtn} onPress={checkAnswer} activeOpacity={0.8}>
              <Text style={s.checkBtnText}>CHECK ✓</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[s.nextBtn, solved && s.nextBtnFull]}
            onPress={() => nextWord(false)}
            activeOpacity={0.8}
          >
            <Text style={s.nextBtnText}>{solved ? '▶  NEXT WORD' : '⏭ SKIP'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </GameScreen>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statBox: {
      flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md,
      borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 12, alignItems: 'center',
    },
    statLabel: { fontSize: 10, color: theme.colors.textMuted, fontWeight: '700', letterSpacing: 1 },
    statVal: { fontSize: 22, fontWeight: '900', color: theme.colors.text, marginTop: 2 },
    scrambledCard: {
      backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg,
      borderWidth: 1, borderColor: theme.colors.cardBorder,
      padding: 24, alignItems: 'center', marginBottom: 12,
    },
    scrambleLabel: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 16 },
    lettersRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
    letterBox: {
      width: 40, height: 48, backgroundColor: theme.colors.primary + '33',
      borderRadius: theme.borderRadius.sm, borderWidth: 2, borderColor: theme.colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    letterText: { fontSize: 22, fontWeight: '900', color: theme.colors.primary },
    wordLen: { fontSize: 12, color: theme.colors.textMuted, marginTop: 12 },
    hintBox: {
      backgroundColor: theme.colors.warning + '22', borderRadius: theme.borderRadius.md,
      borderWidth: 1, borderColor: theme.colors.warning, padding: 12, marginBottom: 12,
    },
    hintText: { fontSize: 14, color: theme.colors.warning, textAlign: 'center' },
    hintBtn: {
      borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.warning + '55',
      padding: 10, alignItems: 'center', marginBottom: 12,
    },
    hintBtnText: { fontSize: 13, color: theme.colors.warning },
    solvedBanner: {
      backgroundColor: theme.colors.success + '22', borderRadius: theme.borderRadius.md,
      borderWidth: 1, borderColor: theme.colors.success, padding: 14, marginBottom: 12, alignItems: 'center',
    },
    solvedText: { fontSize: 16, fontWeight: '800', color: theme.colors.success },
    inputRow: { marginBottom: 12 },
    input: {
      backgroundColor: theme.colors.inputBg, borderWidth: 1, borderColor: theme.colors.inputBorder,
      borderRadius: theme.borderRadius.md, paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 18, fontWeight: '700', color: theme.colors.text, textAlign: 'center', letterSpacing: 4,
    },
    btnRow: { flexDirection: 'row', gap: 10 },
    checkBtn: {
      flex: 1, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
      paddingVertical: 14, alignItems: 'center',
    },
    checkBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
    nextBtn: {
      flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md,
      paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.cardBorder,
    },
    nextBtnFull: {
      backgroundColor: theme.colors.primary, borderColor: theme.colors.primary,
    },
    nextBtnText: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  });
