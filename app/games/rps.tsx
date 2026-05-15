// Rock Paper Scissors with Pattern-Prediction AI
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { GameScreen } from '@/components/ui/GameScreen';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

type Move = 'rock' | 'paper' | 'scissors';
type Result = 'win' | 'lose' | 'draw';

const MOVES: Move[] = ['rock', 'paper', 'scissors'];
const ICONS: Record<Move, string> = { rock: '✊', paper: '🖐️', scissors: '✌️' };
const BEATS: Record<Move, Move> = { rock: 'scissors', scissors: 'paper', paper: 'rock' };
const BEATEN_BY: Record<Move, Move> = { rock: 'paper', paper: 'scissors', scissors: 'rock' };

// AI pattern prediction: analyze player history and predict next move
function aiPredict(history: Move[]): Move {
  if (history.length < 3) return MOVES[Math.floor(Math.random() * 3)];
  // Count frequency of each move
  const freq: Record<Move, number> = { rock: 0, paper: 0, scissors: 0 };
  history.slice(-6).forEach((m) => freq[m]++);
  // Predict player's most likely move
  let predicted: Move = 'rock';
  let maxCount = -1;
  MOVES.forEach((m) => {
    if (freq[m] > maxCount) { maxCount = freq[m]; predicted = m; }
  });
  // Play the move that beats the predicted
  return BEATEN_BY[predicted];
}

export default function RPSGame() {
  const { theme } = useTheme();
  const { addScore } = useAuth();
  const s = makeStyles(theme);

  const [playerHistory, setPlayerHistory] = useState<Move[]>([]);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [round, setRound] = useState(0);
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [aiMove, setAiMove] = useState<Move | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [streak, setStreak] = useState(0);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const play = (move: Move) => {
    const ai = aiPredict(playerHistory);
    let res: Result;
    if (move === ai) res = 'draw';
    else if (BEATS[move] === ai) res = 'win';
    else res = 'lose';

    const newHistory = [...playerHistory, move];
    setPlayerHistory(newHistory);
    setPlayerMove(move);
    setAiMove(ai);
    setResult(res);
    setRound((r) => r + 1);

    const newStreak = res === 'win' ? streak + 1 : 0;
    setStreak(newStreak);

    if (res === 'win') {
      const pts = 10 + newStreak * 2;
      setScore((s) => ({ ...s, player: s.player + pts }));
      addScore('Rock Paper Scissors', pts, true);
    } else if (res === 'lose') {
      setScore((s) => ({ ...s, ai: s.ai + 10 }));
      shake();
    }
  };

  const reset = () => {
    setPlayerHistory([]);
    setScore({ player: 0, ai: 0 });
    setRound(0);
    setPlayerMove(null);
    setAiMove(null);
    setResult(null);
    setStreak(0);
  };

  const resultColors: Record<Result, string> = {
    win: theme.colors.success,
    lose: theme.colors.danger,
    draw: theme.colors.warning,
  };

  return (
    <GameScreen title="Rock Paper Scissors" icon="✊" score={score.player}>
      {/* Scoreboard */}
      <View style={s.scoreboard}>
        <View style={s.scoreCol}>
          <Text style={s.scoreLabel}>YOU</Text>
          <Text style={s.scoreNum}>{score.player}</Text>
        </View>
        <View style={s.scoreMiddle}>
          <Text style={s.roundText}>Round {round}</Text>
          <Text style={s.vsText}>VS</Text>
          {streak > 1 && <Text style={s.streakText}>🔥 {streak} streak!</Text>}
        </View>
        <View style={s.scoreCol}>
          <Text style={s.scoreLabel}>AI</Text>
          <Text style={s.scoreNum}>{score.ai}</Text>
        </View>
      </View>

      {/* Battle Arena */}
      <Animated.View style={[s.arena, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={s.moveSlot}>
          <Text style={s.moveIcon}>{playerMove ? ICONS[playerMove] : '❓'}</Text>
          <Text style={s.moveLabel}>Your Move</Text>
        </View>
        <View style={s.resultCenter}>
          {result && (
            <Text style={[s.resultText, { color: resultColors[result] }]}>
              {result === 'win' ? '🏆 WIN!' : result === 'lose' ? '💀 LOSE' : '🤝 DRAW'}
            </Text>
          )}
        </View>
        <View style={s.moveSlot}>
          <Text style={s.moveIcon}>{aiMove ? ICONS[aiMove] : '🤖'}</Text>
          <Text style={s.moveLabel}>AI Move</Text>
        </View>
      </Animated.View>

      {/* AI Info */}
      <View style={s.aiInfo}>
        <Text style={s.aiInfoText}>⚡ AI learns your patterns after {Math.max(0, 3 - playerHistory.length)} more rounds</Text>
      </View>

      {/* Buttons */}
      <View style={s.buttons}>
        {MOVES.map((move) => (
          <TouchableOpacity
            key={move}
            style={s.moveBtn}
            onPress={() => play(move)}
            activeOpacity={0.75}
          >
            <Text style={s.moveBtnIcon}>{ICONS[move]}</Text>
            <Text style={s.moveBtnLabel}>{move.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.8}>
        <Text style={s.resetBtnText}>↺  RESET GAME</Text>
      </TouchableOpacity>
    </GameScreen>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    scoreboard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      alignItems: 'center',
    },
    scoreCol: { flex: 1, alignItems: 'center' },
    scoreLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 2 },
    scoreNum: { fontSize: 36, fontWeight: '900', color: theme.colors.primary, marginTop: 4 },
    scoreMiddle: { alignItems: 'center', gap: 4 },
    roundText: { fontSize: 12, color: theme.colors.textMuted },
    vsText: { fontSize: 20, fontWeight: '900', color: theme.colors.text },
    streakText: { fontSize: 13, color: theme.colors.warning, fontWeight: '700' },
    arena: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 20,
      marginBottom: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    moveSlot: { flex: 1, alignItems: 'center', gap: 8 },
    moveIcon: { fontSize: 52 },
    moveLabel: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '600' },
    resultCenter: { flex: 1, alignItems: 'center' },
    resultText: { fontSize: 16, fontWeight: '900', textAlign: 'center' },
    aiInfo: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.secondary + '44',
    },
    aiInfoText: { fontSize: 12, color: theme.colors.secondary, textAlign: 'center' },
    buttons: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    moveBtn: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: 20,
      alignItems: 'center',
      gap: 8,
    },
    moveBtnIcon: { fontSize: 36 },
    moveBtnLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.text, letterSpacing: 1 },
    resetBtn: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    resetBtnText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '600' },
  });
