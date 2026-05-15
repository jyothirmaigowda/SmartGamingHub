// Snake Game
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { GameScreen } from '@/components/ui/GameScreen';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');
const COLS = 20;
const ROWS = 20;
const CELL = Math.floor((width - 32) / COLS);
const BOARD_SIZE = CELL * COLS;

type Point = { x: number; y: number };
type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

function randFood(snake: Point[]): Point {
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

const SPEEDS: Record<string, number> = { Slow: 200, Normal: 120, Fast: 70 };

export default function SnakeGame() {
  const { theme } = useTheme();
  const { addScore } = useAuth();
  const s = makeStyles(theme);

  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [dir, setDir] = useState<Dir>('RIGHT');
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [dead, setDead] = useState(false);
  const [speed, setSpeed] = useState('Normal');

  const dirRef = useRef<Dir>('RIGHT');
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const scoreRef = useRef(0);
  const timerRef = useRef<any>(null);

  const changeDir = (newDir: Dir) => {
    const opposites: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (opposites[newDir] !== dirRef.current) {
      dirRef.current = newDir;
      setDir(newDir);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gs) => {
        const { dx, dy } = gs;
        if (Math.abs(dx) > Math.abs(dy)) {
          changeDir(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
          changeDir(dy > 0 ? 'DOWN' : 'UP');
        }
      },
    })
  ).current;

  const tick = useCallback(() => {
    const currentSnake = snakeRef.current;
    const currentDir = dirRef.current;
    const head = currentSnake[0];
    const newHead: Point = {
      x: (head.x + (currentDir === 'RIGHT' ? 1 : currentDir === 'LEFT' ? -1 : 0) + COLS) % COLS,
      y: (head.y + (currentDir === 'DOWN' ? 1 : currentDir === 'UP' ? -1 : 0) + ROWS) % ROWS,
    };
    // Collision
    if (currentSnake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      setDead(true);
      setRunning(false);
      addScore('Snake Game', scoreRef.current, scoreRef.current > 50);
      return;
    }
    let newSnake = [newHead, ...currentSnake];
    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      const newFood = randFood(newSnake);
      foodRef.current = newFood;
      setFood(newFood);
      scoreRef.current += 10;
      setScore(scoreRef.current);
    } else {
      newSnake = newSnake.slice(0, -1);
    }
    snakeRef.current = newSnake;
    setSnake([...newSnake]);
  }, []);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(tick, SPEEDS[speed]);
    }
    return () => clearInterval(timerRef.current);
  }, [running, speed]);

  const startGame = () => {
    const initSnake = [{ x: 10, y: 10 }];
    const initFood = { x: 15, y: 10 };
    snakeRef.current = initSnake;
    foodRef.current = initFood;
    dirRef.current = 'RIGHT';
    scoreRef.current = 0;
    setSnake(initSnake);
    setFood(initFood);
    setDir('RIGHT');
    setScore(0);
    setDead(false);
    setRunning(true);
  };

  return (
    <GameScreen title="Snake Game" icon="🐍" score={score} scrollable={false}>
      <View style={s.container}>
        {/* Speed & Score */}
        <View style={s.topRow}>
          <View style={s.speedRow}>
            {['Slow', 'Normal', 'Fast'].map((sp) => (
              <TouchableOpacity
                key={sp}
                style={[s.speedBtn, speed === sp && s.speedBtnActive]}
                onPress={() => setSpeed(sp)}
              >
                <Text style={[s.speedText, speed === sp && s.speedTextActive]}>{sp}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.scoreText}>{score} pts</Text>
        </View>

        {/* Board */}
        <View style={[s.board, { width: BOARD_SIZE, height: BOARD_SIZE }]} {...panResponder.panHandlers}>
          {/* Food */}
          <View style={[s.food, { left: food.x * CELL, top: food.y * CELL, width: CELL, height: CELL }]} />
          {/* Snake */}
          {snake.map((seg, i) => (
            <View
              key={i}
              style={[
                s.snakeSeg,
                {
                  left: seg.x * CELL,
                  top: seg.y * CELL,
                  width: CELL - 1,
                  height: CELL - 1,
                  backgroundColor: i === 0 ? theme.colors.primary : theme.colors.success,
                  opacity: Math.max(0.4, 1 - i * 0.04),
                },
              ]}
            />
          ))}
          {/* Overlay */}
          {(!running || dead) && (
            <View style={s.overlay}>
              <Text style={s.overlayEmoji}>{dead ? '💀' : '🐍'}</Text>
              <Text style={s.overlayTitle}>{dead ? 'Game Over!' : 'Snake Game'}</Text>
              {dead && <Text style={s.overlayScore}>Score: {score}</Text>}
              <TouchableOpacity style={s.startBtn} onPress={startGame} activeOpacity={0.8}>
                <Text style={s.startBtnText}>{dead ? 'PLAY AGAIN' : 'START'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={s.controls}>
          <TouchableOpacity style={s.ctrl} onPress={() => changeDir('UP')}><Text style={s.ctrlIcon}>⬆️</Text></TouchableOpacity>
          <View style={s.ctrlMid}>
            <TouchableOpacity style={s.ctrl} onPress={() => changeDir('LEFT')}><Text style={s.ctrlIcon}>⬅️</Text></TouchableOpacity>
            <TouchableOpacity style={[s.ctrl, s.ctrlPause]} onPress={() => setRunning((r) => !r)}>
              <Text style={s.ctrlPauseText}>{running ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ctrl} onPress={() => changeDir('RIGHT')}><Text style={s.ctrlIcon}>➡️</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={s.ctrl} onPress={() => changeDir('DOWN')}><Text style={s.ctrlIcon}>⬇️</Text></TouchableOpacity>
        </View>
      </View>
    </GameScreen>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', padding: 16, gap: 12 },
    topRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    speedRow: { flexDirection: 'row', gap: 6 },
    speedBtn: {
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
      backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.cardBorder,
    },
    speedBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    speedText: { fontSize: 12, fontWeight: '700', color: theme.colors.textMuted },
    speedTextActive: { color: '#fff' },
    scoreText: { fontSize: 18, fontWeight: '900', color: theme.colors.primary },
    board: {
      backgroundColor: theme.colors.card,
      borderWidth: 2, borderColor: theme.colors.cardBorder,
      borderRadius: theme.borderRadius.md, overflow: 'hidden', position: 'relative',
    },
    food: {
      position: 'absolute', backgroundColor: theme.colors.danger,
      borderRadius: 3,
    },
    snakeSeg: { position: 'absolute', borderRadius: 3 },
    overlay: {
      position: 'absolute', width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.75)',
      alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    overlayEmoji: { fontSize: 48 },
    overlayTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
    overlayScore: { fontSize: 18, color: theme.colors.primary, fontWeight: '700' },
    startBtn: {
      backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
      paddingHorizontal: 32, paddingVertical: 12, marginTop: 8,
    },
    startBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    controls: { alignItems: 'center', gap: 4 },
    ctrlMid: { flexDirection: 'row', gap: 4, alignItems: 'center' },
    ctrl: {
      width: 52, height: 52, backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.cardBorder,
      alignItems: 'center', justifyContent: 'center',
    },
    ctrlIcon: { fontSize: 22 },
    ctrlPause: { width: 52, height: 52, backgroundColor: theme.colors.primary + '33', borderColor: theme.colors.primary },
    ctrlPauseText: { fontSize: 22 },
  });
