// Tic Tac Toe with Minimax AI
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { GameScreen } from '@/components/ui/GameScreen';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');
const CELL = (width - 64) / 3;

type Cell = 'X' | 'O' | null;
type Board = Cell[];
type Difficulty = 'Easy' | 'Medium' | 'Hard';

function checkWinner(b: Board): Cell | 'draw' | null {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  for (const [a,b2,c] of lines) {
    if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a];
  }
  if (b.every(c => c)) return 'draw';
  return null;
}

function minimax(b: Board, isMax: boolean, depth: number): number {
  const w = checkWinner(b);
  if (w === 'O') return 10 - depth;
  if (w === 'X') return depth - 10;
  if (w === 'draw') return 0;
  if (isMax) {
    let best = -Infinity;
    b.forEach((c, i) => {
      if (!c) {
        b[i] = 'O';
        best = Math.max(best, minimax(b, false, depth + 1));
        b[i] = null;
      }
    });
    return best;
  } else {
    let best = Infinity;
    b.forEach((c, i) => {
      if (!c) {
        b[i] = 'X';
        best = Math.min(best, minimax(b, true, depth + 1));
        b[i] = null;
      }
    });
    return best;
  }
}

function aiMove(b: Board, diff: Difficulty): number {
  const empty = b.map((c,i) => c ? -1 : i).filter(i => i >= 0);
  if (diff === 'Easy') return empty[Math.floor(Math.random() * empty.length)];
  if (diff === 'Medium' && Math.random() < 0.4) return empty[Math.floor(Math.random() * empty.length)];
  let best = -Infinity, bestIdx = empty[0];
  const copy = [...b];
  empty.forEach(i => {
    copy[i] = 'O';
    const score = minimax([...copy], false, 0);
    copy[i] = null;
    if (score > best) { best = score; bestIdx = i; }
  });
  return bestIdx;
}

export default function TicTacToe() {
  const { theme } = useTheme();
  const { addScore } = useAuth();
  const s = makeStyles(theme);

  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Cell | 'draw' | null>(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [diff, setDiff] = useState<Difficulty>('Hard');
  const [winLine, setWinLine] = useState<number[] | null>(null);

  const getWinLine = (b: Board): number[] | null => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const line of lines) {
      const [a,b2,c] = line;
      if (b[a] && b[a] === b[b2] && b[a] === b[c]) return line;
    }
    return null;
  };

  const handlePress = (i: number) => {
    if (!isPlayerTurn || board[i] || winner) return;
    const nb = [...board];
    nb[i] = 'X';
    const w = checkWinner(nb);
    if (w) {
      setBoard(nb);
      setWinner(w);
      setWinLine(getWinLine(nb));
      if (w === 'X') { setScore(s => ({ ...s, player: s.player + 1 })); addScore('Tic Tac Toe', 20, true); }
      else if (w === 'draw') addScore('Tic Tac Toe', 5, false);
      return;
    }
    setBoard(nb);
    setIsPlayerTurn(false);
    setTimeout(() => {
      const ai = aiMove(nb, diff);
      const nb2 = [...nb];
      nb2[ai] = 'O';
      const w2 = checkWinner(nb2);
      setBoard(nb2);
      if (w2) {
        setWinner(w2);
        setWinLine(getWinLine(nb2));
        if (w2 === 'O') { setScore(s => ({ ...s, ai: s.ai + 1 })); addScore('Tic Tac Toe', 0, false); }
        else if (w2 === 'draw') addScore('Tic Tac Toe', 5, false);
      } else {
        setIsPlayerTurn(true);
      }
    }, 400);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setWinLine(null);
  };

  const diffColors: Record<Difficulty, string> = {
    Easy: theme.colors.success,
    Medium: theme.colors.warning,
    Hard: theme.colors.danger,
  };

  return (
    <GameScreen title="Tic Tac Toe" icon="✖️" scrollable={false}>
      <View style={s.container}>
        {/* Difficulty */}
        <View style={s.diffRow}>
          {(['Easy','Medium','Hard'] as Difficulty[]).map((d) => (
            <TouchableOpacity
              key={d}
              style={[s.diffBtn, diff === d && { backgroundColor: diffColors[d] + '33', borderColor: diffColors[d] }]}
              onPress={() => { setDiff(d); reset(); }}
            >
              <Text style={[s.diffText, { color: diff === d ? diffColors[d] : theme.colors.textMuted }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Score */}
        <View style={s.scoreboard}>
          <View style={s.scoreCol}>
            <Text style={s.scoreLabel}>YOU (X)</Text>
            <Text style={[s.scoreNum, { color: theme.colors.secondary }]}>{score.player}</Text>
          </View>
          <Text style={s.scoreVs}>VS</Text>
          <View style={s.scoreCol}>
            <Text style={s.scoreLabel}>AI (O)</Text>
            <Text style={[s.scoreNum, { color: theme.colors.danger }]}>{score.ai}</Text>
          </View>
        </View>

        {/* Status */}
        <Text style={s.status}>
          {winner
            ? winner === 'draw' ? "🤝 It's a Draw!" : winner === 'X' ? '🏆 You Win!' : '🤖 AI Wins!'
            : isPlayerTurn ? '🎯 Your Turn (X)' : '🤖 AI is thinking...'}
        </Text>

        {/* Board */}
        <View style={s.board}>
          {board.map((cell, i) => {
            const isWin = winLine?.includes(i);
            return (
              <TouchableOpacity
                key={i}
                style={[s.cell, isWin && s.cellWin, (i % 3 !== 2) && s.borderRight, (Math.floor(i / 3) !== 2) && s.borderBottom]}
                onPress={() => handlePress(i)}
                activeOpacity={0.7}
              >
                <Text style={[
                  s.cellText,
                  cell === 'X' ? s.xStyle : s.oStyle,
                  isWin && s.cellWinText,
                ]}>
                  {cell}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {winner && (
          <TouchableOpacity style={s.playAgain} onPress={reset} activeOpacity={0.8}>
            <Text style={s.playAgainText}>▶  PLAY AGAIN</Text>
          </TouchableOpacity>
        )}
      </View>
    </GameScreen>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, padding: 16, alignItems: 'center' },
    diffRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    diffBtn: {
      paddingHorizontal: 16, paddingVertical: 8,
      borderRadius: 100, borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      backgroundColor: theme.colors.card,
    },
    diffText: { fontSize: 13, fontWeight: '700' },
    scoreboard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: 16, marginBottom: 12, width: '100%',
      borderWidth: 1, borderColor: theme.colors.cardBorder,
    },
    scoreCol: { flex: 1, alignItems: 'center' },
    scoreLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.textMuted },
    scoreNum: { fontSize: 28, fontWeight: '900', marginTop: 4 },
    scoreVs: { fontSize: 18, fontWeight: '900', color: theme.colors.text },
    status: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 16, textAlign: 'center' },
    board: {
      flexDirection: 'row', flexWrap: 'wrap',
      width: CELL * 3, height: CELL * 3,
      borderRadius: theme.borderRadius.md, overflow: 'hidden',
      borderWidth: 1, borderColor: theme.colors.cardBorder,
      backgroundColor: theme.colors.card,
    },
    cell: { width: CELL, height: CELL, alignItems: 'center', justifyContent: 'center' },
    cellWin: { backgroundColor: theme.colors.primary + '22' },
    borderRight: { borderRightWidth: 1, borderRightColor: theme.colors.cardBorder },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder },
    cellText: { fontSize: CELL * 0.45, fontWeight: '900' },
    xStyle: { color: theme.colors.secondary },
    oStyle: { color: theme.colors.danger },
    cellWinText: { color: theme.colors.primary },
    playAgain: {
      backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
      paddingHorizontal: 32, paddingVertical: 14, marginTop: 20,
    },
    playAgainText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  });
