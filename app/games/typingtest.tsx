// Typing Speed Test Game
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { GameScreen } from '@/components/ui/GameScreen';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

const PASSAGES = [
  "The quick brown fox jumps over the lazy dog. A simple sentence that contains every letter of the alphabet at least once.",
  "Programming is the art of telling another human what one wants the computer to do. Code is poetry written in logic.",
  "In the beginning God created the heavens and the earth. The universe began with a single moment of creation.",
  "Success is not final, failure is not fatal. It is the courage to continue that counts in the end.",
  "Gaming is the ultimate form of play. It combines strategy, creativity, and skill into one immersive experience.",
];

const DURATIONS = [30, 60, 120];

export default function TypingTest() {
  const { theme } = useTheme();
  const { addScore } = useAuth();
  const s = makeStyles(theme);

  const [duration, setDuration] = useState(60);
  const [passage] = useState(() => PASSAGES[Math.floor(Math.random() * PASSAGES.length)]);
  const [typed, setTyped] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const timerRef = useRef<any>(null);
  const inputRef = useRef<TextInput>(null);
  const startTime = useRef<number>(0);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  const handleInput = (text: string) => {
    if (!started && text.length > 0) {
      setStarted(true);
      startTime.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            finishGame(text);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    setTyped(text);
    // Calculate live stats
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const elapsed = (Date.now() - startTime.current) / 60000;
    if (elapsed > 0) setWpm(Math.round(words / elapsed));
    // Accuracy
    let correct = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === passage[i]) correct++;
    }
    setAccuracy(text.length > 0 ? Math.round((correct / text.length) * 100) : 100);
    if (text === passage) {
      clearInterval(timerRef.current);
      finishGame(text);
    }
  };

  const finishGame = (text: string) => {
    setFinished(true);
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const elapsed = (Date.now() - startTime.current) / 60000;
    const finalWpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
    setWpm(finalWpm);
    const pts = finalWpm * 2;
    addScore('Typing Speed Test', pts, finalWpm > 30);
  };

  const reset = () => {
    clearInterval(timerRef.current);
    setTyped('');
    setStarted(false);
    setFinished(false);
    setTimeLeft(duration);
    setWpm(0);
    setAccuracy(100);
  };

  const renderPassage = () => {
    return passage.split('').map((char, i) => {
      let color = theme.colors.textMuted;
      if (i < typed.length) {
        color = typed[i] === char ? theme.colors.success : theme.colors.danger;
      } else if (i === typed.length) {
        color = theme.colors.primary;
      }
      return (
        <Text key={i} style={[s.passageChar, { color, backgroundColor: i === typed.length ? theme.colors.primary + '33' : 'transparent' }]}>
          {char}
        </Text>
      );
    });
  };

  return (
    <GameScreen title="Typing Speed Test" icon="⌨️" score={wpm}>
      {/* Duration Select */}
      <View style={s.durationRow}>
        {DURATIONS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[s.dBtn, duration === d && s.dBtnActive]}
            onPress={() => { setDuration(d); reset(); }}
          >
            <Text style={[s.dBtnText, duration === d && s.dBtnTextActive]}>{d}s</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statVal}>{wpm}</Text>
          <Text style={s.statLabel}>WPM</Text>
        </View>
        <View style={[s.stat, { borderColor: timeLeft <= 10 ? theme.colors.danger : theme.colors.cardBorder }]}>
          <Text style={[s.statVal, { color: timeLeft <= 10 ? theme.colors.danger : theme.colors.primary }]}>
            {timeLeft}
          </Text>
          <Text style={s.statLabel}>SECONDS</Text>
        </View>
        <View style={s.stat}>
          <Text style={[s.statVal, { color: accuracy >= 90 ? theme.colors.success : theme.colors.warning }]}>
            {accuracy}%
          </Text>
          <Text style={s.statLabel}>ACCURACY</Text>
        </View>
      </View>

      {/* Passage Display */}
      {!finished ? (
        <>
          <View style={s.passageBox}>
            <Text style={s.passageTitle}>Type the text below:</Text>
            <Text style={s.passage}>{renderPassage()}</Text>
          </View>
          <TextInput
            ref={inputRef}
            style={s.input}
            value={typed}
            onChangeText={handleInput}
            placeholder={started ? '' : 'Start typing to begin...'}
            placeholderTextColor={theme.colors.textMuted}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            editable={!finished}
          />
          {!started && (
            <Text style={s.hint}>⌨️ Just start typing — the timer begins automatically!</Text>
          )}
        </>
      ) : (
        <View style={s.resultCard}>
          <Text style={s.resultEmoji}>{wpm >= 60 ? '🚀' : wpm >= 40 ? '👍' : '💪'}</Text>
          <Text style={s.resultTitle}>Test Complete!</Text>
          <Text style={s.resultWpm}>{wpm} WPM</Text>
          <Text style={s.resultSub}>{accuracy}% accuracy</Text>
          <View style={s.ratingRow}>
            <Text style={s.ratingText}>
              Rating: {wpm >= 80 ? '🔥 Expert' : wpm >= 60 ? '⚡ Fast' : wpm >= 40 ? '👍 Average' : '💪 Beginner'}
            </Text>
          </View>
          <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.8}>
            <Text style={s.resetBtnText}>▶  TRY AGAIN</Text>
          </TouchableOpacity>
        </View>
      )}
    </GameScreen>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    durationRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    dBtn: {
      flex: 1, paddingVertical: 10, borderRadius: 100,
      backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.cardBorder,
      alignItems: 'center',
    },
    dBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    dBtnText: { fontSize: 14, fontWeight: '700', color: theme.colors.textMuted },
    dBtnTextActive: { color: '#fff' },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    stat: {
      flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md,
      borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 12, alignItems: 'center',
    },
    statVal: { fontSize: 24, fontWeight: '900', color: theme.colors.primary },
    statLabel: { fontSize: 10, color: theme.colors.textMuted, fontWeight: '700', marginTop: 2 },
    passageBox: {
      backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg,
      borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 16, marginBottom: 12,
    },
    passageTitle: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 10, fontWeight: '600' },
    passage: { fontSize: 18, lineHeight: 30, flexWrap: 'wrap' },
    passageChar: { fontSize: 18 },
    input: {
      backgroundColor: theme.colors.inputBg, borderWidth: 1, borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md, padding: 14, fontSize: 16, color: theme.colors.text,
      minHeight: 100, textAlignVertical: 'top', marginBottom: 8,
    },
    hint: { fontSize: 13, color: theme.colors.textMuted, textAlign: 'center' },
    resultCard: {
      backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg,
      borderWidth: 1, borderColor: theme.colors.primary, padding: 32, alignItems: 'center', gap: 10,
    },
    resultEmoji: { fontSize: 64 },
    resultTitle: { fontSize: 22, fontWeight: '900', color: theme.colors.text },
    resultWpm: { fontSize: 48, fontWeight: '900', color: theme.colors.primary },
    resultSub: { fontSize: 16, color: theme.colors.textSecondary },
    ratingRow: { backgroundColor: theme.colors.surfaceAlt, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 6 },
    ratingText: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
    resetBtn: {
      backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
      paddingHorizontal: 32, paddingVertical: 14, marginTop: 8,
    },
    resetBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  });
