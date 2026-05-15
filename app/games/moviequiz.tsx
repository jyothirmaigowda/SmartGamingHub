// Guess the Movie Game
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { GameScreen } from '@/components/ui/GameScreen';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

const MOVIES = [
  { emoji: '🦁👑🌍', hint: 'Disney animated film, African savanna', answer: 'LION KING', year: 1994 },
  { emoji: '🕷️🕸️🏙️', hint: 'Marvel superhero, New York city', answer: 'SPIDER-MAN', year: 2002 },
  { emoji: '🧙‍♂️💍🗡️', hint: 'Epic fantasy trilogy', answer: 'LORD OF THE RINGS', year: 2001 },
  { emoji: '🚢❄️💔🌊', hint: 'Romantic disaster film, ocean liner', answer: 'TITANIC', year: 1997 },
  { emoji: '🤖🌎💥👊', hint: 'Giant robots vs aliens', answer: 'TRANSFORMERS', year: 2007 },
  { emoji: '🦈🏖️😱', hint: 'Classic Spielberg thriller, beach town', answer: 'JAWS', year: 1975 },
  { emoji: '🧊👸❄️⛄', hint: 'Disney princess, let it go', answer: 'FROZEN', year: 2013 },
  { emoji: '🚀⭐👽🌌', hint: 'Galaxy far far away', answer: 'STAR WARS', year: 1977 },
  { emoji: '🦇🌃🃏😈', hint: 'Dark Knight vs Joker, Gotham', answer: 'THE DARK KNIGHT', year: 2008 },
  { emoji: '🎭💀☠️🏴‍☠️', hint: 'Caribbean swashbuckling adventure', answer: 'PIRATES OF THE CARIBBEAN', year: 2003 },
  { emoji: '🦸‍♂️🛡️⚡🔨', hint: 'Norse god of thunder, Marvel', answer: 'THOR', year: 2011 },
  { emoji: '👻🏚️👻🔮', hint: 'Friendly ghost cartoon', answer: 'CASPER', year: 1995 },
];

export default function MovieQuiz() {
  const { theme } = useTheme();
  const { addScore } = useAuth();
  const s = makeStyles(theme);

  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);

  const movie = MOVIES[idx % MOVIES.length];

  const checkAnswer = () => {
    const ans = input.trim().toUpperCase().replace(/[^A-Z\s]/g, '');
    const target = movie.answer.toUpperCase();
    if (ans === target || target.includes(ans) && ans.length >= 4) {
      const pts = showHint ? 10 : 20;
      setScore((s) => s + pts);
      setCorrect((c) => c + 1);
      setSolved(true);
      addScore('Guess the Movie', pts, true);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 800);
    }
  };

  const nextMovie = () => {
    setIdx((i) => i + 1);
    setInput('');
    setSolved(false);
    setShowHint(false);
    setWrong(false);
    setRound((r) => r + 1);
  };

  return (
    <GameScreen title="Guess the Movie" icon="🎬" score={score}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statBox}><Text style={s.statLabel}>ROUND</Text><Text style={s.statVal}>{round + 1}</Text></View>
          <View style={s.statBox}><Text style={s.statLabel}>CORRECT</Text><Text style={[s.statVal, { color: theme.colors.success }]}>{correct}</Text></View>
          <View style={s.statBox}><Text style={s.statLabel}>SCORE</Text><Text style={[s.statVal, { color: theme.colors.primary }]}>{score}</Text></View>
        </View>

        {/* Emoji Clue */}
        <View style={s.emojiCard}>
          <Text style={s.emojiLabel}>Guess the movie from emoji clues:</Text>
          <Text style={s.emoji}>{movie.emoji}</Text>
          <Text style={s.yearText}>Released: {movie.year}</Text>
        </View>

        {/* Hint */}
        {showHint ? (
          <View style={s.hintBox}>
            <Text style={s.hintText}>💡 {movie.hint}</Text>
          </View>
        ) : (
          <TouchableOpacity style={s.hintBtn} onPress={() => setShowHint(true)}>
            <Text style={s.hintBtnText}>💡 Reveal Hint (-10 pts)</Text>
          </TouchableOpacity>
        )}

        {/* Solved */}
        {solved ? (
          <View style={s.solvedCard}>
            <Text style={s.solvedEmoji}>🎉</Text>
            <Text style={s.solvedTitle}>Correct!</Text>
            <Text style={s.solvedAnswer}>{movie.answer}</Text>
          </View>
        ) : (
          <View style={[s.inputWrap, wrong && { borderColor: theme.colors.danger }]}>
            <TextInput
              style={s.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type movie title..."
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              onSubmitEditing={checkAnswer}
            />
          </View>
        )}

        <View style={s.btnRow}>
          {!solved && (
            <TouchableOpacity style={s.checkBtn} onPress={checkAnswer} activeOpacity={0.8}>
              <Text style={s.checkBtnText}>CHECK ✓</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[s.nextBtn, solved && s.nextBtnFull]}
            onPress={nextMovie}
            activeOpacity={0.8}
          >
            <Text style={s.nextBtnText}>{solved ? '▶  NEXT MOVIE' : '⏭ SKIP'}</Text>
          </TouchableOpacity>
        </View>

        {/* Answer letters count */}
        {!solved && (
          <Text style={s.lettersHint}>
            Answer has {movie.answer.length} characters
            {movie.answer.includes(' ') ? ` (${movie.answer.split(' ').length} words)` : ''}
          </Text>
        )}
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
    statVal: { fontSize: 20, fontWeight: '900', color: theme.colors.text, marginTop: 2 },
    emojiCard: {
      backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg,
      borderWidth: 1, borderColor: theme.colors.cardBorder,
      padding: 28, alignItems: 'center', marginBottom: 12,
    },
    emojiLabel: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 14 },
    emoji: { fontSize: 56, letterSpacing: 8 },
    yearText: { fontSize: 12, color: theme.colors.textMuted, marginTop: 10 },
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
    solvedCard: {
      backgroundColor: theme.colors.success + '22', borderRadius: theme.borderRadius.lg,
      borderWidth: 1, borderColor: theme.colors.success,
      padding: 20, alignItems: 'center', marginBottom: 12, gap: 6,
    },
    solvedEmoji: { fontSize: 40 },
    solvedTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.success },
    solvedAnswer: { fontSize: 20, fontWeight: '900', color: theme.colors.text },
    inputWrap: {
      borderWidth: 1, borderColor: theme.colors.inputBorder,
      borderRadius: theme.borderRadius.md, marginBottom: 12,
    },
    input: {
      backgroundColor: theme.colors.inputBg, padding: 14,
      fontSize: 16, fontWeight: '700', color: theme.colors.text,
      textAlign: 'center', letterSpacing: 2, borderRadius: theme.borderRadius.md,
    },
    btnRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    checkBtn: {
      flex: 1, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
      paddingVertical: 14, alignItems: 'center',
    },
    checkBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
    nextBtn: {
      flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md,
      paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.cardBorder,
    },
    nextBtnFull: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    nextBtnText: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
    lettersHint: { fontSize: 12, color: theme.colors.textMuted, textAlign: 'center' },
  });
