// Magic Square Game
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { GameScreen } from '@/components/ui/GameScreen';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');
const N = 3;
const CELL_SIZE = Math.floor((width - 80) / N);

// Generate a magic square using Siamese/odd-order method (always 3x3)
function generateMagicSquare(): number[][] {
  const n = 3;
  const sq: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  let row = 0;
  let col = Math.floor(n / 2);
  for (let num = 1; num <= n * n; num++) {
    sq[row][col] = num;
    const nr = (row - 1 + n) % n;
    const nc = (col + 1) % n;
    if (sq[nr][nc]) {
      row = (row + 1) % n;
    } else {
      row = nr;
      col = nc;
    }
  }
  return sq;
}

const MAGIC = generateMagicSquare();
const MAGIC_SUM = 15; // 3x3 magic constant

function shuffleGrid(grid: number[][]): number[][] {
  const flat = grid.flat();
  for (let i = flat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flat[i], flat[j]] = [flat[j], flat[i]];
  }
  return [flat.slice(0, 3), flat.slice(3, 6), flat.slice(6, 9)];
}

export default function MagicSquareGame() {
  const { theme } = useTheme();
  const { addScore } = useAuth();
  const s = makeStyles(theme);

  const [grid, setGrid] = useState<number[][]>(() => shuffleGrid(MAGIC));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);

  const checkSolved = (g: number[][]) => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (g[r][c] !== MAGIC[r][c]) return false;
      }
    }
    return true;
  };

  const handleCellPress = (r: number, c: number) => {
    if (solved) return;
    if (!selected) {
      setSelected([r, c]);
    } else {
      const [sr, sc] = selected;
      if (sr === r && sc === c) {
        setSelected(null);
        return;
      }
      const ng = grid.map((row) => [...row]);
      [ng[sr][sc], ng[r][c]] = [ng[r][c], ng[sr][sc]];
      setGrid(ng);
      setSelected(null);
      setMoves((m) => m + 1);
      if (checkSolved(ng)) {
        setSolved(true);
        const pts = Math.max(10, 200 - moves * 5);
        setScore((s) => s + pts);
        addScore('Magic Square', pts, true);
      }
    }
  };

  const getRowSum = (r: number) => grid[r].reduce((a, b) => a + b, 0);
  const getColSum = (c: number) => grid.reduce((a, row) => a + row[c], 0);
  const getDiag1 = () => [0, 1, 2].reduce((a, i) => a + grid[i][i], 0);
  const getDiag2 = () => [0, 1, 2].reduce((a, i) => a + grid[i][2 - i], 0);

  const reset = () => {
    setGrid(shuffleGrid(MAGIC));
    setSelected(null);
    setMoves(0);
    setSolved(false);
  };

  const showSolution = () => {
    setGrid(MAGIC.map((r) => [...r]));
    setSolved(true);
    addScore('Magic Square', 5, false);
  };

  return (
    <GameScreen title="Magic Square" icon="🔲" score={score}>
      {/* Instructions */}
      <View style={s.infoCard}>
        <Text style={s.infoTitle}>Magic Square 3×3</Text>
        <Text style={s.infoText}>
          Arrange numbers 1–9 so every row, column, and diagonal sums to {MAGIC_SUM}.
          Tap two cells to swap them.
        </Text>
      </View>

      <View style={s.movesRow}>
        <Text style={s.movesText}>Moves: {moves}</Text>
        {solved && <Text style={[s.solvedBadge, { color: theme.colors.success }]}>✅ SOLVED!</Text>}
      </View>

      {/* Grid */}
      <View style={s.gridContainer}>
        {/* Column sums header */}
        <View style={s.sumRow}>
          <View style={{ width: CELL_SIZE }} />
          {[0, 1, 2].map((c) => (
            <View key={c} style={[s.sumCell]}>
              <Text style={[s.sumText, { color: getColSum(c) === MAGIC_SUM ? theme.colors.success : theme.colors.textMuted }]}>
                {getColSum(c)}
              </Text>
            </View>
          ))}
          <View style={{ width: CELL_SIZE / 2 }} />
        </View>

        {grid.map((row, r) => (
          <View key={r} style={s.row}>
            {/* Row sum */}
            <View style={s.sumCell}>
              <Text style={[s.sumText, { color: getRowSum(r) === MAGIC_SUM ? theme.colors.success : theme.colors.textMuted }]}>
                {getRowSum(r)}
              </Text>
            </View>
            {row.map((val, c) => {
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const isCorrect = val === MAGIC[r][c];
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    s.cell,
                    isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '33' },
                    isCorrect && !isSelected && { borderColor: theme.colors.success + '88' },
                  ]}
                  onPress={() => handleCellPress(r, c)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.cellText, isSelected && { color: theme.colors.primary }]}>{val}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Diagonal sums */}
        <View style={s.diagRow}>
          <Text style={[s.sumText, { color: getDiag1() === MAGIC_SUM ? theme.colors.success : theme.colors.textMuted }]}>
            ↘ {getDiag1()}
          </Text>
          <Text style={[s.sumText, { color: getDiag2() === MAGIC_SUM ? theme.colors.success : theme.colors.textMuted }]}>
            ↙ {getDiag2()}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={s.btnRow}>
        <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.8}>
          <Text style={s.resetBtnText}>↺ SHUFFLE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.solveBtn} onPress={showSolution} activeOpacity={0.8}>
          <Text style={s.solveBtnText}>👁 SOLUTION</Text>
        </TouchableOpacity>
      </View>
    </GameScreen>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    infoCard: {
      backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg,
      borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 16, marginBottom: 14,
    },
    infoTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.primary, marginBottom: 6 },
    infoText: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20 },
    movesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    movesText: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
    solvedBadge: { fontSize: 16, fontWeight: '900' },
    gridContainer: { alignItems: 'center', marginBottom: 16 },
    sumRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    sumCell: { width: CELL_SIZE, alignItems: 'center' },
    sumText: { fontSize: 13, fontWeight: '700' },
    row: { flexDirection: 'row', marginBottom: 4 },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      backgroundColor: theme.colors.card,
      borderWidth: 2,
      borderColor: theme.colors.cardBorder,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 2,
    },
    cellText: { fontSize: 28, fontWeight: '900', color: theme.colors.text },
    diagRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: CELL_SIZE / 2, marginTop: 8 },
    btnRow: { flexDirection: 'row', gap: 12 },
    resetBtn: {
      flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md,
      borderWidth: 1, borderColor: theme.colors.cardBorder, paddingVertical: 14, alignItems: 'center',
    },
    resetBtnText: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
    solveBtn: {
      flex: 1, backgroundColor: theme.colors.primary + '33', borderRadius: theme.borderRadius.md,
      borderWidth: 1, borderColor: theme.colors.primary, paddingVertical: 14, alignItems: 'center',
    },
    solveBtnText: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
  });
