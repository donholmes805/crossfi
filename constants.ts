import { User, Difficulty } from "./types";

export const TURN_DURATION = 60; // seconds
export const BONUS_TIME_THRESHOLD = 30; // seconds
export const BONUS_TIME_AWARD = 5; // seconds
export const HINT_COST = 10; // seconds
export const GRID_SIZE = 10;

export const PVP_WORDS_TO_WIN = 2;
export const PVP_TOTAL_WORDS_IN_PUZZLE = 4;

export const PVC_WORDS_TO_WIN = 5;
export const PVC_TOTAL_WORDS_IN_PUZZLE = 10;


export const AI_OPPONENTS: Record<Difficulty, User> = {
    [Difficulty.Easy]: {
        id: 'ai_easy',
        name: 'Recruit',
        avatar: 'deadeye',
        wins: 0,
        losses: 0,
        totalBonuses: 0,
        isAI: true,
    },
    [Difficulty.Medium]: {
        id: 'ai_medium',
        name: 'Veteran',
        avatar: 'boomer',
        wins: 0,
        losses: 0,
        totalBonuses: 0,
        isAI: true,
    },
    [Difficulty.Hard]: {
        id: 'ai_hard',
        name: 'Commando',
        avatar: 'sgt_stealth',
        wins: 0,
        losses: 0,
        totalBonuses: 0,
        isAI: true,
    },
};