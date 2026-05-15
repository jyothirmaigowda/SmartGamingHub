import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlayerProfile {
  username: string;
  passwordHash: string;
  totalScore: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  highestScore: number;
  lastPlayedGame: string;
  achievements: string[];
  gameStats: Record<string, { played: number; wins: number; bestScore: number }>;
  createdAt: string;
  avatar: string;
}

interface AuthContextType {
  currentUser: PlayerProfile | null;
  allUsers: PlayerProfile[];
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<PlayerProfile>) => Promise<void>;
  addScore: (game: string, score: number, won: boolean) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AVATARS = ['🎮', '🕹️', '👾', '🤖', '🦁', '🐉', '⚡', '🌟', '🔥', '💎'];

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<PlayerProfile | null>(null);
  const [allUsers, setAllUsers] = useState<PlayerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, sessionData] = await Promise.all([
        AsyncStorage.getItem('gaming_hub_users'),
        AsyncStorage.getItem('gaming_hub_session'),
      ]);
      const users: PlayerProfile[] = usersData ? JSON.parse(usersData) : [];
      setAllUsers(users);
      if (sessionData) {
        const { username } = JSON.parse(sessionData);
        const user = users.find((u) => u.username === username);
        if (user) setCurrentUser(user);
      }
    } catch (e) {
      console.error('Load error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUsers = async (users: PlayerProfile[]) => {
    await AsyncStorage.setItem('gaming_hub_users', JSON.stringify(users));
    setAllUsers(users);
  };

  const login = async (username: string, password: string) => {
    if (!username.trim() || !password.trim()) {
      return { success: false, error: 'Please fill in all fields.' };
    }
    const user = allUsers.find(
      (u) => u.username.toLowerCase() === username.toLowerCase().trim()
    );
    if (!user) return { success: false, error: 'Username not found.' };
    if (user.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Incorrect password.' };
    }
    setCurrentUser(user);
    await AsyncStorage.setItem('gaming_hub_session', JSON.stringify({ username: user.username }));
    return { success: true };
  };

  const register = async (username: string, password: string) => {
    const trimmed = username.trim();
    if (!trimmed || !password.trim()) return { success: false, error: 'Please fill in all fields.' };
    if (trimmed.length < 3) return { success: false, error: 'Username must be at least 3 characters.' };
    if (password.length < 4) return { success: false, error: 'Password must be at least 4 characters.' };
    const exists = allUsers.find((u) => u.username.toLowerCase() === trimmed.toLowerCase());
    if (exists) return { success: false, error: 'Username already taken.' };

    const newUser: PlayerProfile = {
      username: trimmed,
      passwordHash: simpleHash(password),
      totalScore: 0,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      highestScore: 0,
      lastPlayedGame: 'None',
      achievements: [],
      gameStats: {},
      createdAt: new Date().toISOString(),
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    };
    const updated = [...allUsers, newUser];
    await saveUsers(updated);
    setCurrentUser(newUser);
    await AsyncStorage.setItem('gaming_hub_session', JSON.stringify({ username: newUser.username }));
    return { success: true };
  };

  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem('gaming_hub_session');
  };

  const updateProfile = async (updates: Partial<PlayerProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    const newUsers = allUsers.map((u) => (u.username === currentUser.username ? updated : u));
    await saveUsers(newUsers);
  };

  const addScore = async (game: string, score: number, won: boolean) => {
    if (!currentUser) return;
    const prevStats = currentUser.gameStats[game] || { played: 0, wins: 0, bestScore: 0 };
    const isWin = won;
    const isDraw = !won && score > 0;
    const isLoss = !won && !isDraw;

    const newAchievements = [...currentUser.achievements];
    const newTotal = currentUser.totalScore + score;
    const newHighest = Math.max(currentUser.highestScore, score);

    if (currentUser.gamesPlayed === 0) newAchievements.push('First Game!');
    if (newTotal >= 100 && !newAchievements.includes('Century Scorer')) newAchievements.push('Century Scorer');
    if (newTotal >= 500 && !newAchievements.includes('Score Master')) newAchievements.push('Score Master');
    if (currentUser.wins + (isWin ? 1 : 0) >= 10 && !newAchievements.includes('Veteran Gamer'))
      newAchievements.push('Veteran Gamer');

    const updated: PlayerProfile = {
      ...currentUser,
      totalScore: newTotal,
      gamesPlayed: currentUser.gamesPlayed + 1,
      wins: currentUser.wins + (isWin ? 1 : 0),
      losses: currentUser.losses + (isLoss ? 1 : 0),
      draws: currentUser.draws + (isDraw ? 1 : 0),
      highestScore: newHighest,
      lastPlayedGame: game,
      achievements: newAchievements,
      gameStats: {
        ...currentUser.gameStats,
        [game]: {
          played: prevStats.played + 1,
          wins: prevStats.wins + (isWin ? 1 : 0),
          bestScore: Math.max(prevStats.bestScore, score),
        },
      },
    };
    setCurrentUser(updated);
    const newUsers = allUsers.map((u) => (u.username === currentUser.username ? updated : u));
    await saveUsers(newUsers);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, allUsers, isLoading, login, register, logout, updateProfile, addScore }}
    >
      {children}
    </AuthContext.Provider>
  );
}
