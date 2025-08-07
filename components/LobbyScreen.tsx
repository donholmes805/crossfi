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
      <div className="bg-black/20 p-6 rounded-lg w-full flex flex-col items-center text-center border-2 border-cyan-500/30 transition-all duration-300 min-h-[280px] justify-center relative shadow-lg shadow-cyan-500/10">
        {isHost && <p className="text-xs font-bold text-yellow-400 mb-2 absolute top-2 left-2">[HOST]</p>}
        <UserAvatar avatarKey={user.avatar} className="w-24 h-24 md:w-32 md:h-32 rounded-lg mb-4 border-2 border-gray-700" />
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
    <div className="group border-2 border-dashed border-gray-600 rounded-lg w-full flex flex-col items-center justify-center p-6 min-h-[280px] transition-all duration-300 bg-black/20">
       <p className="text-gray-400 text-lg animate-pulse" style={{fontFamily: 'var(--font-display)'}}>Waiting for opponent...</p>
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
        <div className="mt-6 w-full max-w-lg mx-auto bg-black/20 p-4 rounded-lg border border-gray-700">
            <p className="text-center font-bold text-gray-200 mb-3">Invite a Friend</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="w-full form-input"
                    aria-label="Invitation Link"
                />
                <button
                    onClick={handleCopyLink}
                    className="btn btn-primary flex items-center gap-2 px-4 py-2"
                >
                    <ClipboardIcon className="w-5 h-5"/>
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
             <p className="text-xs text-gray-500 mt-2 text-center">
                Note: The invite link only works when opened in a new tab on the <strong className="text-gray-400">same computer</strong>. True online play is not yet supported.
            </p>
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
    
    const unsubscribe = roomService.subscribeToRooms(fetchRoom);
    
    return () => unsubscribe();
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
    <div className="panel w-full max-w-4xl text-center p-6 md:p-8">
        <h2 className="text-3xl mb-2 text-gray-100 text-glow-cyan" style={{color: 'var(--color-cyan)'}}>Prepare for Battle</h2>
        <p className="text-gray-400 mb-8">{getLobbyMessage()}</p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8">
            <PlayerSpot user={player1} isCurrentUser={currentUser?.id === player1?.id} isHost={isHost || isPvc} />
            <span className="text-5xl font-black text-gray-500 my-4 md:my-0 glitch">VS</span>
            <PlayerSpot user={player2} isCurrentUser={currentUser?.id === player2?.id} />
        </div>

        {error && <p className="text-red-300 mt-6 bg-red-900/50 p-3 rounded-lg border border-red-700">{error}</p>}
        
        {isHost && !player2 && <InviteFriend roomId={roomId} />}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
                onClick={onBack}
                className="btn btn-secondary"
            >
                {isPvc ? 'Back' : isHost ? 'Cancel Room' : 'Leave Seat'}
            </button>
            {(isHost || isPvc) && (
                 <button
                    onClick={handleStart}
                    disabled={isLoading || !player1 || !player2}
                    className="btn btn-primary w-full max-w-sm"
                >
                    {isLoading ? 'Loading...' : 'Start War'}
                </button>
            )}
        </div>
    </div>
  );
};

export default LobbyScreen;