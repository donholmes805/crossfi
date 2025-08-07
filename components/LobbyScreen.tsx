import React, { useState, useEffect } from 'react';
import { User, GameMode, Difficulty, Player } from '../types';
import { AI_OPPONENTS } from '../constants';
import UserAvatar from './icons/UserAvatar';
import ClipboardIcon from './icons/ClipboardIcon';
import { p2pService, P2PMessage } from '../services/p2pService';
import { DataConnection } from 'peerjs';

interface LobbyScreenProps {
  onReadyToStart: (player1: User, player2: User) => void;
  isLoading: boolean;
  error: string | null;
  currentUser: User;
  onBack: () => void;
  gameMode: GameMode;
  difficulty: Difficulty;
  peerId: string | null;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

const PlayerSpot: React.FC<{ user: User | null; isCurrentUser?: boolean, isHost?: boolean }> = ({ user, isCurrentUser, isHost }) => {
  return (
    <div className="card bg-dark text-light w-100">
      <div className={`card-body d-flex flex-column align-items-center text-center p-4 ${!user ? 'justify-content-center' : ''}`} style={{ minHeight: '280px' }}>
        {user ? (
          <>
            {isHost && <span className="badge bg-warning-subtle text-warning-emphasis position-absolute top-0 start-0 m-2">HOST</span>}
            <UserAvatar avatarKey={user.avatar} className="rounded mb-3" style={{ width: '100px', height: '100px' }} />
            <h3 className="card-title h5 text-truncate w-100" title={user.name}>{user.name}</h3>
            {user.isAI ?
              <p className="text-danger small">[AI OPPONENT]</p>
              : <p className="text-body-secondary small">W: {user.wins} | L: {user.losses} | Bonuses: {user.totalBonuses}</p>
            }
            {isCurrentUser && <p className="mt-2 small text-info">(This is you)</p>}
          </>
        ) : (
          <div className="d-flex flex-column align-items-center">
            <div className="spinner-border text-secondary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-body-secondary">Waiting for opponent...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const InviteFriend: React.FC<{ peerId: string | null }> = ({ peerId }) => {
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (peerId) {
            const url = `${window.location.origin}${window.location.pathname}?join=${peerId}`;
            setInviteLink(url);
        }
    }, [peerId]);

    const handleCopyLink = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    if (!peerId) return <div className="mt-4"><div className="spinner-border text-info" role="status"><span className="visually-hidden">Loading...</span></div><p className="d-inline-block ms-2">Generating invite link...</p></div>;

    return (
        <div className="mt-4 w-100 mx-auto card bg-black bg-opacity-25 p-3">
            <p className="text-center fw-bold text-light mb-2">Invite a Friend</p>
            <div className="input-group">
                <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="form-control"
                    aria-label="Invitation Link"
                />
                <button
                    onClick={handleCopyLink}
                    className="btn btn-primary d-flex align-items-center"
                >
                    <ClipboardIcon className="me-2" style={{width: '20px', height: '20px'}}/>
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
             <p className="text-body-secondary small mt-2 text-center">
                Share this link with a friend to connect directly and play!
            </p>
        </div>
    );
};

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onReadyToStart, isLoading, error, currentUser, onBack, gameMode, difficulty, peerId, setPlayers }) => {
  const [guest, setGuest] = useState<User | null>(null);

  const isPvc = gameMode === GameMode.PlayerVsComputer;
  const isHost = p2pService.isHost;

  const player1 = isPvc ? currentUser : currentUser;
  const player2 = isPvc ? AI_OPPONENTS[difficulty] : guest;

  useEffect(() => {
    if (isPvc) return;

    const handleConnection = (conn: DataConnection) => {
      // The host has received a connection
      setGuest({ id: conn.peer, name: 'Opponent', avatar: 'pyro', wins: 0, losses: 0, totalBonuses: 0 }); // Placeholder until we exchange user data
    };

    const handleData = (data: P2PMessage) => {
        // Handle initial user data exchange if needed
    };

    const handleConnectionOpen = (conn: DataConnection) => {
        // The guest has connected
        setGuest({ id: conn.peer, name: 'Opponent', avatar: 'pyro', wins: 0, losses: 0, totalBonuses: 0 });
    };

    let unsubscribes: (() => void)[] = [];
    if(isHost) {
        unsubscribes.push(p2pService.on('connection-open', handleConnection));
    } else {
        unsubscribes.push(p2pService.on('connection-open', handleConnectionOpen));
    }
    unsubscribes.push(p2pService.on('data-received', handleData));

    return () => unsubscribes.forEach(unsub => unsub());
  }, [isHost, isPvc, setPlayers, currentUser]);

  useEffect(() => {
    if(player1 && player2) {
       setPlayers([{...player1, score: 0, bonusTime: 0, bonusesEarned: 0}, {...player2, score: 0, bonusTime: 0, bonusesEarned: 0}]);
    } else if (player1) {
       setPlayers([{...player1, score: 0, bonusTime: 0, bonusesEarned: 0}]);
    }
  }, [player1, player2, setPlayers]);


  const getLobbyMessage = () => {
      if(isPvc) return 'Your AI opponent is waiting.';
      if(isHost) {
          return player2 ? 'Your opponent has arrived! Start the war when you are ready.' : 'You are the host. Share the link below to invite an opponent.';
      }
      return 'You have joined the room. Waiting for the host to start the battle.';
  }

  return (
    <div className="card bg-dark text-light w-100" style={{maxWidth: '800px'}}>
      <div className="card-body text-center p-4 p-md-5">
        <h2 className="card-title h1 mb-2 text-info text-glow-cyan">Prepare for Battle</h2>
        <p className="text-body-secondary mb-4">{getLobbyMessage()}</p>

        <div className="row align-items-center g-3">
          <div className="col-md-5">
            <PlayerSpot user={player1} isCurrentUser={true} isHost={isHost || isPvc} />
          </div>
          <div className="col-md-2">
            <span className="display-4 fw-black text-secondary d-none d-md-block">VS</span>
             <span className="d-md-none text-secondary">VS</span>
          </div>
          <div className="col-md-5">
            <PlayerSpot user={player2} />
          </div>
        </div>

        {error && <div className="alert alert-danger mt-4">{error}</div>}
        
        {isHost && !player2 && <InviteFriend peerId={peerId} />}

        <div className="mt-4 d-grid gap-2 d-sm-flex justify-content-center">
          <button onClick={onBack} className="btn btn-secondary">
            {isPvc ? 'Back' : isHost ? 'Cancel Room' : 'Leave Seat'}
          </button>
          {(isHost || isPvc) && (
            <button
              onClick={() => player1 && player2 && onReadyToStart(player1, player2)}
              disabled={isLoading || !player1 || !player2}
              className="btn btn-primary"
            >
              {isLoading ? 'Loading...' : 'Start War'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;
