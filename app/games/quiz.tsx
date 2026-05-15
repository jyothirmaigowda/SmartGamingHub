// Quiz Master Game
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { GameScreen } from '@/components/ui/GameScreen';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

const QUESTIONS = [
  { q: 'What is the capital of France?', opts: ['Berlin','Madrid','Paris','Rome'], a: 2, cat: 'Geography' },
  { q: 'Which planet is known as the Red Planet?', opts: ['Venus','Mars','Jupiter','Saturn'], a: 1, cat: 'Science' },
  { q: 'How many sides does a hexagon have?', opts: ['5','6','7','8'], a: 1, cat: 'Math' },
  { q: 'Who painted the Mona Lisa?', opts: ['Van Gogh','Picasso','Da Vinci','Rembrandt'], a: 2, cat: 'Art' },
  { q: 'What is 12 × 12?', opts: ['132','144','156','168'], a: 1, cat: 'Math' },
  { q: 'Which element has the symbol "O"?', opts: ['Gold','Oxygen','Iron','Carbon'], a: 1, cat: 'Science' },
  { q: 'In what year did World War II end?', opts: ['1943','1944','1945','1946'], a: 2, cat: 'History' },
  { q: 'What is the largest ocean?', opts: ['Atlantic','Indian','Arctic','Pacific'], a: 3, cat: 'Geography' },
  { q: 'Who wrote "Hamlet"?', opts: ['Dickens','Shakespeare','Twain','Tolstoy'], a: 1, cat: 'Literature' },
  { q: 'How many bones are in the adult human body?', opts: ['196','206','216','226'], a: 1, cat: 'Science' },
  { q: 'What is the square root of 144?', opts: ['10','11','12','13'], a: 2, cat: 'Math' },
  { q: 'Which country invented pizza?', opts: ['France','Spain','Greece','Italy'], a: 3, cat: 'Culture' },
  { q: 'What is the chemical symbol for Gold?', opts: ['Gd','Go','Au','Ag'], a: 2, cat: 'Science' },
  { q: 'How many continents are there?', opts: ['5','6','7','8'], a: 2, cat: 'Geography' },
  { q: 'Who invented the telephone?', opts: ['Edison','Bell','Tesla','Marconi'], a: 1, cat: 'History' },
];

const TIME_PER_Q = 20;

export default function QuizGame() {
  const { theme } = useTheme();
  const { addScore } = useAuth();
  const s = makeStyles(theme);

  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [finished, setFinished] = useState(false);
  const [correct, setCorrect] = useState(0);

  const timerRef = useRef<any>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;

  const q = QUESTIONS[qIndex];

  useEffect(() => {
    if (answered || finished) return;
    setTimeLeft(TIME_PER_Q);
    progressAnim.setValue(1);
    Animated.timing(progressAnim, { toValue: 0, duration: TIME_PER_Q * 1000, useNativeDriver: false }).start();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIndex, answered]);

  const handleAnswer = (idx: number) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setSelected(idx);
    setAnswered(true);
    let pts = 0;
    if (idx === q.a) {
      pts = 10 + Math.floor(timeLeft * 0.5);
      setScore((s) => s + pts);
      setCorrect((c) => c + 1);
    }
  };

  const next = () => {
    if (qIndex + 1 >= QUESTIONS.length) {
      setFinished(true);
      addScore('Quiz Master', score, correct > QUESTIONS.length / 2);
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const reset = () => {
    setQIndex(0); setScore(0); setSelected(null);
    setAnswered(false); setFinished(false); setCorrect(0); setTimeLeft(TIME_PER_Q);
  };

  const optionColor = (i: number) => {
    if (!answered) return theme.colors.card;
    if (i === q.a) return theme.colors.success + '33';
    if (i === selected) return theme.colors.danger + '33';
    return theme.colors.card;
  };
  const optionBorder = (i: number) => {
    if (!answered) return theme.colors.cardBorder;
    if (i === q.a) return theme.colors.success;
    if (i === selected) return theme.colors.danger;
    return theme.colors.cardBorder;
  };

  if (finished) {
    const pct = Math.round((correct / QUESTIONS.length) * 100);
    return (
      <GameScreen title="Quiz Master" icon="🧠" score={score}>
        <View style={s.finishCard}>
          <Text style={s.finishEmoji}>{pct >= 70 ? '🏆' : pct >= 50 ? '😊' : '😅'}</Text>
          <Text style={s.finishTitle}>Quiz Complete!</Text>
          <Text style={s.finishScore}>{score} pts</Text>
          <Text style={s.finishStats}>{correct}/{QUESTIONS.length} correct · {pct}% accuracy</Text>
          <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.8}>
            <Text style={s.resetBtnText}>▶  PLAY AGAIN</Text>
          </TouchableOpacity>
        </View>
      </GameScreen>
    );
  }

  return (
    <GameScreen title="Quiz Master" icon="🧠" score={score}>
      {/* Progress */}
      <View style={s.meta}>
        <Text style={s.qCount}>Q {qIndex + 1}/{QUESTIONS.length}</Text>
        <View style={s.catBadge}>
          <Text style={s.catText}>{q.cat}</Text>
        </View>
        <Text style={[s.timer, { color: timeLeft <= 5 ? theme.colors.danger : theme.colors.text }]}>
          ⏱ {timeLeft}s
        </Text>
      </View>

      <View style={s.progressBg}>
        <Animated.View style={[s.progressFill, {
          width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          backgroundColor: timeLeft <= 5 ? theme.colors.danger : theme.colors.primary,
        }]} />
      </View>

      {/* Question */}
      <View style={s.questionCard}>
        <Text style={s.questionText}>{q.q}</Text>
      </View>

      {/* Options */}
      {q.opts.map((opt, i) => (
        <TouchableOpacity
          key={i}
          style={[s.option, { backgroundColor: optionColor(i), borderColor: optionBorder(i) }]}
          onPress={() => handleAnswer(i)}
          disabled={answered}
          activeOpacity={0.8}
        >
          <View style={[s.optBullet, { backgroundColor: optionBorder(i) + '44' }]}>
            <Text style={s.optBulletText}>{['A','B','C','D'][i]}</Text>
          </View>
          <Text style={s.optText}>{opt}</Text>
          {answered && i === q.a && <Text>✅</Text>}
          {answered && i === selected && i !== q.a && <Text>❌</Text>}
        </TouchableOpacity>
      ))}

      {answered && (
        <TouchableOpacity style={s.nextBtn} onPress={next} activeOpacity={0.8}>
          <Text style={s.nextBtnText}>{qIndex + 1 >= QUESTIONS.length ? '🏁  FINISH' : '▶  NEXT QUESTION'}</Text>
        </TouchableOpacity>
      )}
    </GameScreen>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    meta: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
    qCount: { flex: 1, fontSize: 13, color: theme.colors.textMuted, fontWeight: '600' },
    catBadge: {
      backgroundColor: theme.colors.primary + '33',
      borderRadius: 100,
      paddingHorizontal: 10, paddingVertical: 3,
    },
    catText: { fontSize: 11, color: theme.colors.primary, fontWeight: '700' },
    timer: { fontSize: 14, fontWeight: '800' },
    progressBg: {
      height: 6, backgroundColor: theme.colors.surface,
      borderRadius: 3, overflow: 'hidden', marginBottom: 16,
    },
    progressFill: { height: '100%', borderRadius: 3 },
    questionCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1, borderColor: theme.colors.cardBorder,
      padding: 20, marginBottom: 16,
    },
    questionText: { fontSize: 18, fontWeight: '700', color: theme.colors.text, lineHeight: 28 },
    option: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      borderRadius: theme.borderRadius.md, borderWidth: 1,
      padding: 14, marginBottom: 10,
    },
    optBullet: {
      width: 32, height: 32, borderRadius: 16,
      alignItems: 'center', justifyContent: 'center',
    },
    optBulletText: { fontSize: 13, fontWeight: '800', color: theme.colors.text },
    optText: { flex: 1, fontSize: 15, color: theme.colors.text, fontWeight: '500' },
    nextBtn: {
      backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
      paddingVertical: 15, alignItems: 'center', marginTop: 8,
    },
    nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
    finishCard: {
      backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg,
      borderWidth: 1, borderColor: theme.colors.primary,
      padding: 32, alignItems: 'center', gap: 12,
    },
    finishEmoji: { fontSize: 64 },
    finishTitle: { fontSize: 24, fontWeight: '900', color: theme.colors.text },
    finishScore: { fontSize: 40, fontWeight: '900', color: theme.colors.primary },
    finishStats: { fontSize: 15, color: theme.colors.textSecondary },
    resetBtn: {
      backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
      paddingHorizontal: 32, paddingVertical: 14, marginTop: 8,
    },
    resetBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  });
