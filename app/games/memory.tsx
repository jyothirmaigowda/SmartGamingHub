// Memory Pattern Game - Simon Says style
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { GameScreen } from '@/components/ui/GameScreen';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');
const BTN_SIZE = (width - 64) / 2;

const COLORS = ['#FF2D7E', '#00D4FF', '#00FF88', '#FFD700'];
const COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

export default function MemoryGame() {
  const { theme } = useTheme();
  const { addScore } = useAuth();
  const s = makeStyles(theme);

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'showing' | 'input' | 'gameover'>('idle');
  const [activeBtn, setActiveBtn] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Press START to play!');
  const scaleAnims = useRef(COLORS.map(() => new Animated.Value(1))).current;

  const flashButton = (idx: number, duration = 400) => {
    return new Promise<void>((resolve) => {
      setActiveBtn(idx);
      Animated.sequence([
        Animated.timing(scaleAnims[idx], { toValue: 0.9, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(scaleAnims[idx], { toValue: 1, duration: duration / 2, useNativeDriver: true }),
      ]).start(() => {
        setActiveBtn(null);
        resolve();
      });
    });
  };

  const showSequence = async (seq: number[]) => {
    setPhase('showing');
    setMessage('Watch carefully...');
    await new Promise((r) => setTimeout(r, 600));
    for (const idx of seq) {
      await flashButton(idx, 500);
      await new Promise((r) => setTimeout(r, 200));
    }
    setPhase('input');
    setMessage('Your turn! Repeat the sequence');
    setPlayerSeq([]);
  };

  const startGame = () => {
    const first = Math.floor(Math.random() * 4);
    const seq = [first];
    setSequence(seq);
    setScore(0);
    showSequence(seq);
  };

  const handlePress = (idx: number) => {
    if (phase !== 'input') return;
    flashButton(idx, 200);
    const newPlayerSeq = [...playerSeq, idx];
    setPlayerSeq(newPlayerSeq);
    const pos = newPlayerSeq.length - 1;
    if (newPlayerSeq[pos] !== sequence[pos]) {
      setPhase('gameover');
      setMessage(`Wrong! Game over. Score: ${score}`);
      addScore('Memory Pattern', score, false);
      return;
    }
    if (newPlayerSeq.length === sequence.length) {
      const pts = sequence.length * 5;
      setScore((s) => s + pts);
      setMessage('Correct! +' + pts + ' pts');
      const next = Math.floor(Math.random() * 4);
      const newSeq = [...sequence, next];
      setSequence(newSeq);
      setTimeout(() => showSequence(newSeq), 1000);
    }
  };

  return (
    <GameScreen title="Memory Pattern" icon="🧩" score={score} scrollable={false}>
      <View style={s.container}>
        <View style={s.info}>
          <Text style={s.level}>Level {sequence.length || 0}</Text>
          <Text style={s.message}>{message}</Text>
        </View>

        <View style={s.grid}>
          {COLORS.map((color, i) => (
            <Animated.View key={i} style={{ transform: [{ scale: scaleAnims[i] }] }}>
              <TouchableOpacity
                style={[
                  s.btn,
                  { backgroundColor: color + (activeBtn === i ? 'FF' : '55') },
                  { borderColor: color, shadowColor: color },
                  activeBtn === i && s.btnActive,
                ]}
                onPress={() => handlePress(i)}
                disabled={phase !== 'input'}
                activeOpacity={0.8}
              >
                <Text style={s.btnText}>{COLOR_NAMES[i]}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {(phase === 'idle' || phase === 'gameover') && (
          <TouchableOpacity style={s.startBtn} onPress={startGame} activeOpacity={0.8}>
            <Text style={s.startBtnText}>{phase === 'gameover' ? '↺  TRY AGAIN' : '▶  START GAME'}</Text>
          </TouchableOpacity>
        )}

        <View style={s.seqDisplay}>
          <Text style={s.seqLabel}>Sequence length: {sequence.length}</Text>
          <View style={s.seqDots}>
            {sequence.map((s, i) => (
              <View key={i} style={[s.dot, { backgroundColor: COLORS[s] }]} />
            ))}
          </View>
        </View>
      </View>
    </GameScreen>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'space-around' },
    info: { alignItems: 'center' },
    level: { fontSize: 22, fontWeight: '900', color: theme.colors.primary },
    message: { fontSize: 15, color: theme.colors.textSecondary, marginTop: 6, textAlign: 'center' },
    grid: {
      flexDirection: 'row', flexWrap: 'wrap', gap: 16,
      justifyContent: 'center',
    },
    btn: {
      width: BTN_SIZE, height: BTN_SIZE,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 3,
      alignItems: 'center', justifyContent: 'center',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7,
      shadowRadius: 12,
      elevation: 8,
    },
    btnActive: { shadowRadius: 20, shadowOpacity: 1 },
    btnText: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 2 },
    startBtn: {
      backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.lg,
      paddingHorizontal: 40, paddingVertical: 14,
    },
    startBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
    seqDisplay: { alignItems: 'center', gap: 8 },
    seqLabel: { fontSize: 12, color: theme.colors.textMuted },
    seqDots: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5 },
  });
