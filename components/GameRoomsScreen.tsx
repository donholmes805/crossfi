import React, { useState, useEffect } from 'react';
import { User, Room } from '../types';
import * as roomService from '../services/roomService';
import UserAvatar from './icons/UserAvatar';

interface GameRoomsScreenProps {
  currentUser: User;
  onNewGame: () => void;
  onJoinRoom: (roomId: string) => void;
  onViewLeaderboard: () => void;
  error: string | null;
}

const GameRoomsScreen: React.FC<GameRoomsScreenProps> = ({ onNewGame, onJoinRoom, onViewLeaderboard, error, currentUser }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = () => {
      const allRooms = roomService.getAllRooms();
      const sortedRooms = allRooms.sort((a, b) => {
        if (a.status === 'waiting' && b.status !== 'waiting') return -1;
        if (a.status !== 'waiting' && b.status === 'waiting') return 1;
        const timeA = parseInt(a.id.split('_')[1] || '0', 10);
        const timeB = parseInt(b.id.split('_')[1] || '0', 10);
        return timeB - timeA; // Show newest first
      });
      setRooms(sortedRooms);
      setIsLoading(false);
    };

    fetchRooms(); // Initial fetch
    const unsubscribe = roomService.subscribeToRooms(fetchRooms); // Subscribe to real-time updates
    return () => unsubscribe(); // Clean up subscription
  }, []);

  return (
    <div className="w-full max-w-3xl text-center bg-gray-900/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold mb-4 text-gray-100">Game Rooms</h2>
      <p className="text-gray-400 mb-6">Join an available room or create your own battle.</p>

      {error && <p className="text-red-300 mb-4 bg-red-900/50 p-3 rounded-lg border border-red-700">{error}</p>}
      
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 mb-6">
        {isLoading ? (
          <p className="text-gray-400">Searching for rooms...</p>
        ) : rooms.length > 0 ? (
          rooms.map(room => {
            const isWaiting = room.status === 'waiting';
            const canJoin = isWaiting && room.host.id !== currentUser.id;
            
            return (
              <div key={room.id} className={`bg-gray-800/60 p-4 rounded-xl flex items-center gap-4 border-2 border-gray-700 transition-all ${!isWaiting ? 'opacity-70' : ''}`}>
                <UserAvatar avatarKey={room.host.avatar} className="w-14 h-14 rounded-lg flex-shrink-0" />
                <div className="flex-grow text-left overflow-hidden">
                  <p className="font-bold text-lg text-gray-200 truncate">{room.host.name}'s Game</p>
                  <p className="text-sm text-gray-400">
                    {isWaiting ? 'Waiting for an opponent...' : 'Match in progress...'}
                  </p>
                </div>
                {canJoin ? (
                    <button
                        onClick={() => onJoinRoom(room.id)}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
                    >
                        Join
                    </button>
                ) : (
                    <span className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg flex-shrink-0 cursor-default">
                        {isWaiting ? 'Your Room' : 'In Progress'}
                    </span>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 py-8">No open rooms available. Why not create one?</p>
        )}
      </div>

      <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onViewLeaderboard}
          className="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all duration-300 w-full sm:w-auto"
        >
          Leaderboard
        </button>
        <button
          onClick={onNewGame}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default GameRoomsScreen;