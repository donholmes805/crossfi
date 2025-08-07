export enum GameState {
  MainMenu,
  Profile,
  Leaderboard,
  ModeSelection,
  Lobby,
  CoinFlip,
  InGame,
  GameOver,
  ThemeVoting,
  WinnerCelebration,
}

export enum GameMode {
  PlayerVsPlayer,
  PlayerVsComputer,
}

export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export enum Direction {
  Horizontal,
  Vertical,
  Diagonal,
}

// Represents a registered user with persistent stats
export interface User {
  id:string;
  name: string;
  avatar: string; // The key for the avatar component
  wins: number;
  losses: number;
  totalBonuses: number;
  isAI?: boolean;
}

// Represents a player within an active game session
export interface Player extends User {
  score: number;
  bonusTime: number; // available bonus time in seconds
  bonusesEarned: number; // number of 5s bonus chunks earned this game
}

export interface ChatMessage {
  userId: string;
  userName: string;
  message: string;
}

export interface GridCell {
  letter: string;
  partOfWord?: string; // The text of the word this cell belongs to
}

export interface WordLocation {
    text: string;
    startRow: number;
    startCol: number;
    direction: Direction;
    found: boolean;
    foundBy: string | null; // User ID
}

export interface CellCoord {
    row: number;
    col: number;
}

export interface GridData {
    grid: GridCell[][];
    words: WordLocation[];
}

export interface FullGameState {
    players: Player[];
    gridData: GridData;
    currentPlayerIndex: number;
    turnType: 'normal' | 'steal';
    wordToFind: WordLocation | null;
    timeLeft: number;
    isTurnActive: boolean;
    turnResult: 'success' | 'fail' | null;
    hintedCell: CellCoord | null;
    chatMessages: ChatMessage[];
}

export enum ChatEventType {
    GameStart = 'GAME_START',
    PlayerFoundWord = 'PLAYER_FOUND_WORD',
    AiFoundWord = 'AI_FOUND_WORD',
    AiStealTurn = 'AI_STEAL_TURN',
}