import { User, Room } from '../types';

const ROOMS_STORAGE_KEY = 'crossfiword-wars-rooms';
const ROOMS_UPDATED_EVENT = 'crossfiword-wars-rooms-updated';

const getRoomsFromStorage = (): Record<string, Room> => {
    try {
        const rooms = localStorage.getItem(ROOMS_STORAGE_KEY);
        return rooms ? JSON.parse(rooms) : {};
    } catch (e) {
        console.error("Failed to parse rooms from localStorage", e);
        return {};
    }
};

const saveRoomsToStorage = (rooms: Record<string, Room>) => {
    try {
        localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    } catch (e) {
        console.error("Failed to save rooms to localStorage", e);
    }
};

// Notifies listeners in the current tab that room data has changed.
const notifyChanges = () => {
    window.dispatchEvent(new Event(ROOMS_UPDATED_EVENT));
};

// Saves rooms to storage and notifies all tabs.
const saveRoomsAndNotify = (rooms: Record<string, Room>) => {
    saveRoomsToStorage(rooms);
    notifyChanges();
};

// When another tab changes localStorage, this event fires.
// We then notify components in the current tab to re-render.
window.addEventListener('storage', (event) => {
    if (event.key === ROOMS_STORAGE_KEY) {
        notifyChanges();
    }
});


export const createRoom = (host: User): Room => {
    const rooms = getRoomsFromStorage();
    const newRoom: Room = {
        id: `room_${Date.now()}`,
        host,
        guest: null,
        status: 'waiting',
    };
    rooms[newRoom.id] = newRoom;
    saveRoomsAndNotify(rooms);
    return newRoom;
};

export const getRoom = (roomId: string): Room | null => {
    const rooms = getRoomsFromStorage();
    return rooms[roomId] || null;
};

export const getAllRooms = (): Room[] => {
    return Object.values(getRoomsFromStorage());
};

export const joinRoom = (roomId: string, guest: User): Room | null => {
    const rooms = getRoomsFromStorage();
    const room = rooms[roomId];
    if (room && room.status === 'waiting' && room.host.id !== guest.id) {
        room.guest = guest;
        room.status = 'full';
        rooms[roomId] = room;
        saveRoomsAndNotify(rooms);
        return room;
    }
    return null; // Room not found, already full, or user tried to join their own room
};

export const leaveRoom = (roomId: string, userId: string) => {
    const rooms = getRoomsFromStorage();
    const room = rooms[roomId];
    if (!room) return;

    if (room.host.id === userId) {
        // Host leaves, room is deleted
        delete rooms[roomId];
    } else if (room.guest?.id === userId) {
        // Guest leaves
        room.guest = null;
        room.status = 'waiting';
        rooms[roomId] = room;
    }
    
    saveRoomsAndNotify(rooms);
};

export const deleteRoom = (roomId: string) => {
    const rooms = getRoomsFromStorage();
    if (rooms[roomId]) {
        delete rooms[roomId];
        saveRoomsAndNotify(rooms);
    }
};

/**
 * Allows React components to subscribe to room data changes.
 * @param callback The function to call when rooms are updated.
 * @returns An unsubscribe function.
 */
export const subscribeToRooms = (callback: () => void): (() => void) => {
    window.addEventListener(ROOMS_UPDATED_EVENT, callback);
    return () => window.removeEventListener(ROOMS_UPDATED_EVENT, callback);
};


// Clean up stale rooms on load (e.g., older than 1 hour)
(() => {
    const rooms = getRoomsFromStorage();
    const oneHour = 60 * 60 * 1000;
    let changed = false;
    for (const roomId in rooms) {
        const room = rooms[roomId];
        const roomTimestamp = parseInt(room.id.split('_')[1], 10);
        if (Date.now() - roomTimestamp > oneHour) {
            delete rooms[roomId];
            changed = true;
        }
    }
    if (changed) {
        saveRoomsToStorage(rooms);
    }
})();