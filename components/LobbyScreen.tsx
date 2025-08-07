import React, { useState, useEffect, useCallback } from 'react';
import { User, GameMode, Difficulty, Room } from '../types';
import { AI_OPPONENTS } from '../constants';
import * as roomService from '../services/roomService';
import UserAvatar from './icons/UserAvatar';
import ClipboardIcon from './icons/ClipboardIcon';

interface LobbyScreenProps {
  onReadyToStart: (player1: User, player2: User) => void;
  isLoading: boolean;
  error: string | null;
  currentUser: User | null;
  onBack: () => void;
  gameMode: GameMode;
  difficulty: Difficulty;
  roomId: string | null;
}

const PlayerSpot: React.FC<{ user: User | null; isCurrentUser?: boolean, isHost?: boolean }> = ({ user, isCurrentUser, isHost }) => {
  if (user) {
    return (
      <div className="bg-gray-800/50 p-6 rounded-2xl w-full flex flex-col items-center text-center border-2 border-gray-700 transition-all duration-300 min-h-[250px] justify-center">
        {isHost && <p className="text-xs font-bold text-yellow-400 mb-2">[HOST]</p>}
        <UserAvatar avatarKey={user.avatar} className="w-24 h-24 md:w-32 md:h-32 rounded-xl mb-4" />
        <h3 className="text-xl md:text-2xl font-bold text-gray-100 truncate w-full" title={user.name}>{user.name}</h3>
        {user.isAI ? 
            <p className="text-sm text-red-400 font-bold">[AI OPPONENT]</p>
            : <p className="text-sm text-gray-400">W: {user.wins} | L: {user.losses} | Bonuses: {user.totalBonuses}</p>
        }
        {isCurrentUser && <p className="mt-2 text-xs font-bold text-blue-400">(This is you)</p>}
      </div>
    );
  }
  return (
    <div className="group border-2 border-dashed border-gray-600 rounded-2xl w-full flex flex-col items-center justify-center p-6 h-full min-h-[250px] transition-all duration-300">
       <p className="text-gray-400 text-lg animate-pulse">Waiting for opponent...</p>
    </div>
  );
};


const InviteFriend: React.FC<{ roomId: string | null }> = ({ roomId }) => {
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (roomId) {
            const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
            setInviteLink(url);
        }
    }, [roomId]);

    const handleCopyLink = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    if (!roomId) return null;

    return (
        <div className="mt-6 w-full max-w-lg mx-auto bg-gray-800/70 p-4 rounded-xl border border-gray-700">
            <p className="text-center font-bold text-gray-200 mb-3">Invite a Friend</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 font-mono text-sm"
                    aria-label="Invitation Link"
                />
                <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ClipboardIcon className="w-5 h-5"/>
                    {copied ? 'Copied!' : 'Copy Link'}
                </button>
            </div>
        </div>
    );
};

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onReadyToStart, isLoading, error, currentUser, onBack, gameMode, difficulty, roomId }) => {
  const [room, setRoom] = useState<Room | null>(null);

  const isPvc = gameMode === GameMode.PlayerVsComputer;
  const isHost = !isPvc && currentUser?.id === room?.host.id;

  const player1 = isPvc ? currentUser : room?.host || null;
  const player2 = isPvc ? AI_OPPONENTS[difficulty] : room?.guest || null;
  
  useEffect(() => {
    if (isPvc) return;

    const fetchRoom = () => {
        if (roomId) {
            const currentRoom = roomService.getRoom(roomId);
            if (currentRoom) {
                setRoom(currentRoom);
            } else {
                // The room no longer exists, go back.
                onBack();
            }
        }
    };
    
    fetchRoom(); // Initial fetch
    
    // Subscribe to changes in any room. The fetchRoom function will handle
    // checking if the current room is the one that changed.
    const unsubscribe = roomService.subscribeToRooms(fetchRoom);
    
    return () => unsubscribe(); // Unsubscribe on cleanup
  }, [isPvc, roomId, onBack]);
  
  const handleStart = () => {
    if (player1 && player2) {
      onReadyToStart(player1, player2);
    }
  };

  const getLobbyMessage = () => {
      if(isPvc) return 'Your AI opponent is waiting.';
      if(isHost) {
          return player2 ? 'Your opponent has arrived! Start the war when you are ready.' : 'You are the host. Waiting for an opponent to join.';
      }
      return 'You have joined the room. Waiting for the host to start the battle.';
  }

  return (
    <div className="w-full max-w-4xl text-center bg-gray-900/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold mb-2 text-gray-100">Prepare for Battle</h2>
        <p className="text-gray-400 mb-8">{getLobbyMessage()}</p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8">
            <PlayerSpot user={player1} isCurrentUser={currentUser?.id === player1?.id} isHost={isHost || isPvc} />
            <span className="text-4xl font-black text-gray-500 my-4 md:my-0">VS</span>
            <PlayerSpot user={player2} isCurrentUser={currentUser?.id === player2?.id} />
        </div>

        {error && <p className="text-red-300 mt-6 bg-red-900/50 p-3 rounded-lg border border-red-700">{error}</p>}
        
        {isHost && !player2 && <InviteFriend roomId={roomId} />}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
                onClick={onBack}
                className="px-8 py-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
                {isPvc ? 'Back' : isHost ? 'Cancel Room' : 'Leave Seat'}
            </button>
            {(isHost || isPvc) && (
                 <button
                    onClick={handleStart}
                    disabled={isLoading || !player1 || !player2}
                    className="w-full max-w-sm px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    {isLoading ? 'Loading...' : 'Start War'}
                </button>
            )}
        </div>
    </div>
  );
};

export default LobbyScreen;