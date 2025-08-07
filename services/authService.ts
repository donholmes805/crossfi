import { User, Player } from '../types';

const USERS_STORAGE_KEY = 'crossfiword-wars-users';

// A simple map of avatar keys to display names for the UI
export const AVATARS: Record<string, string> = {
    'sgt_stealth': 'Sgt. Stealth',
    'pyro': 'Pyro',
    'deadeye': 'Deadeye',
    'boomer': 'Boomer',
};

const getStoredUsers = (): Record<string, User> => {
    try {
        const users = localStorage.getItem(USERS_STORAGE_KEY);
        return users ? JSON.parse(users) : {};
    } catch (e) {
        console.error("Failed to parse users from localStorage", e);
        return {};
    }
};

const saveStoredUsers = (users: Record<string, User>) => {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
        console.error("Failed to save users to localStorage", e);
    }
};

export const signup = (name: string, avatar: string): { user: User | null; error?: string } => {
    const users = getStoredUsers();
    
    if (Object.values(users).some(u => u.name.toLowerCase() === name.toLowerCase())) {
        return { user: null, error: 'A user with this name already exists.' };
    }

    const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name,
        avatar,
        wins: 0,
        losses: 0,
        totalBonuses: 0,
    };

    users[newUser.id] = newUser;
    saveStoredUsers(users);
    
    return { user: newUser };
};

export const deleteUser = (userId: string) => {
    const users = getStoredUsers();
    if (users[userId]) {
        delete users[userId];
        saveStoredUsers(users);
    }
};

export const getUsers = (): User[] => {
    return Object.values(getStoredUsers());
};

export const updateStats = (winner: Player, loser: Player) => {
    const users = getStoredUsers();
    
    // Ensure both users exist in storage, creating them if they're new (e.g., guests)
    if (!users[winner.id]) {
        users[winner.id] = { ...winner, wins: 0, losses: 0, totalBonuses: 0 };
    }
    if (!users[loser.id]) {
        users[loser.id] = { ...loser, wins: 0, losses: 0, totalBonuses: 0 };
    }
    
    users[winner.id].wins += 1;
    users[winner.id].totalBonuses += winner.bonusesEarned;

    users[loser.id].losses += 1;
    users[loser.id].totalBonuses += loser.bonusesEarned;
    
    saveStoredUsers(users);
};