// Color Match Rush — Stroop Effect Game
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { GameScreen } from '@/components/ui/GameScreen';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

const COLORS = [
  { name: 'RED', hex: '#FF2D4E' },
  { name: 'BLUE', hex: '#00AAFF' },
  { name: 'GREEN', hex: '#00CC66' },
  { name: 'YELLOW', hex: '#FFD700' },
  { name: 'PURPLE', hex: '#CC44FF' },
  { name: 'ORANGE', hex: '#FF7722' },
];

function rand(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRound() {
  const textColor = rand(COLORS);
  let inkColor = rand(COLORS);
  // 50% chance of mismatch (makes it harder)
  return { textColor, inkColor };
}

const TIME = 30;
const CORRECT_PTS = 10;
const WRONG_PTS = -5;

export default function ColorMatch() {
  const { theme } = useTheme();
  const { addScore } = useAuth();
  const s = makeStyles(theme);

  const [score, setScore] = useState(0);
  const [round, setRound] = useState(generateRound());
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const timerRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!started) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started]);

  useEffect(() => {
    if (finished) {
      addScore('Color Match Rush', score, score > 50);
    }
  }, [finished]);

  const flash = (correct: boolean) => {
    setFeedback(correct ? 'correct' : 'wrong');
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start(() => setFeedback(null));
  };

  const handleAnswer = (colorName: string) => {
    if (!started) setStarted(true);
    if (finished) return;

    const isCorrect = colorName === round.inkColor.name;
    setTotal((t) => t + 1);
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const pts = CORRECT_PTS + (newStreak >= 3 ? 5 : 0);
      setScore((s) => s + pts);
      setCorrectCount((c) => c + 1);
      flash(true);
    } else {
      setStreak(0);
      setScore((s) => Math.max(0, s + WRONG_PTS));
      flash(false);
    }
    setRound(generateRound());
  };

  const reset = () => {
    clearInterval(timerRef.current);
    setScore(0); setTimeLeft(TIME); setStarted(false);
    setFinished(false); setFeedback(null); setStreak(0);
    setTotal(0); setCorrectCount(0); setRound(generateRound());
  };

  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  if (finished) {
    return (
      <GameScreen title="Color Match Rush" icon="🎨" score={score}>
        <View style={s.resultCard}>
          <Text style={s.resultEmoji}>{score >= 100 ? '🧠' : score >= 60 ? '⚡' : '💪'}</Text>
          <Text style={s.resultTitle}>Time Up!</Text>
          <Text style={s.resultScore}>{score} pts</Text>
          <Text style={s.resultSub}>{correctCount}/{total} correct · {accuracy}% accuracy</Text>
          <Text style={s.resultSub}>Best streak: {streak > 0 ? streak : '—'}</Text>
          <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.8}>
            <Text style={s.resetBtnText}>▶  PLAY AGAIN</Text>
          </TouchableOpacity>
        </View>
      </GameScreen>
    );
  }

  return (
    <GameScreen title="Color Match Rush" icon="🎨" score={score} scrollable={false}>
      <View style={s.container}>
        {/* Instructions */}
        <View style={s.instructCard}>
          <Text style={s.instructText}>
            Tap the button matching the <Text style={{ fontWeight: '900', color: theme.colors.primary }}>INK COLOR</Text> of the word — not what it says!
          </Text>
        </View>

        {/* Timer & Streak */}
        <View style={s.topStats}>
          <Text style={[s.timer, { color: timeLeft <= 8 ? theme.colors.danger : theme.colors.text }]}>⏱ {timeLeft}s</Text>
          {streak >= 3 && <Text style={s.streakText}>🔥 {streak}x streak!</Text>}
          <Text style={s.accuracy}>{accuracy}% accuracy</Text>
        </View>

        {/* Word Display */}
        <Animated.View style={[
          s.wordCard,
          { opacity: fadeAnim },
          feedback === 'correct' && { borderColor: theme.colors.success },
          feedback === 'wrong' && { borderColor: theme.colors.danger },
        ]}>
          <Text style={s.stroopHint}>What COLOR is the ink?</Text>
          <Text style={[s.word, { color: round.inkColor.hex }]}>{round.textColor.name}</Text>
        </Animated.View>

        {/* Color Buttons */}
        <View style={s.colorGrid}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color.name}
              style={[s.colorBtn, { backgroundColor: color.hex + '33', borderColor: color.hex }]}
              onPress={() => handleAnswer(color.name)}
              activeOpacity={0.75}
            >
              <View style={[s.colorDot, { backgroundColor: color.hex }]} />
              <Text style={[s.colorBtnText, { color: color.hex }]}>{color.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!started && (
          <View style={s.startOverlay}>
            <Text style={s.startText}>Tap any color to begin!</Text>
          </View>
        )}
      </View>
    </GameScreen>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 16 },
    instructCard: {
      backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md,
      borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 12,
    },
    instructText: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 },
    topStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timer: { fontSize: 20, fontWeight: '900' },
    streakText: { fontSize: 15, fontWeight: '800', color: theme.colors.warning },
    accuracy: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '600' },
    wordCard: {
      backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl,
      borderWidth: 2, borderColor: theme.colors.cardBorder,
      padding: 32, alignItems: 'center', gap: 10,
    },
    stroopHint: { fontSize: 12, color: theme.colors.textMuted, letterSpacing: 1 },
    word: { fontSize: 52, fontWeight: '900', letterSpacing: 4 },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
    colorBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 16, paddingVertical: 14,
      borderRadius: theme.borderRadius.lg, borderWidth: 2,
      minWidth: '42%', justifyContent: 'center',
    },
    colorDot: { width: 16, height: 16, borderRadius: 8 },
    colorBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 1 },
    startOverlay: { alignItems: 'center' },
    startText: { fontSize: 14, color: theme.colors.primary, fontWeight: '700' },
    resultCard: {
      backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl,
      borderWidth: 1, borderColor: theme.colors.primary,
      padding: 32, alignItems: 'center', gap: 12, margin: 16,
    },
    resultEmoji: { fontSize: 64 },
    resultTitle: { fontSize: 24, fontWeight: '900', color: theme.colors.text },
    resultScore: { fontSize: 48, fontWeight: '900', color: theme.colors.primary },
    resultSub: { fontSize: 15, color: theme.colors.textSecondary },
    resetBtn: {
      backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
      paddingHorizontal: 32, paddingVertical: 14, marginTop: 8,
    },
    resetBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  });
