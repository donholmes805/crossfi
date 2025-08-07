
import Peer, { DataConnection, PeerJSOption } from 'peerjs';
import { Player, GridData, ChatMessage, User, FullGameState } from '../types';

// A generic, type-safe event emitter.
class EventEmitter<Events extends Record<string, (...args: any[]) => void>> {
    private listeners: { [K in keyof Events]?: Array<Events[K]> } = {};

    on<K extends keyof Events>(event: K, listener: Events[K]): () => void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(listener);
        return () => this.off(event, listener);
    }

    off<K extends keyof Events>(event: K, listener: Events[K]): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event]!.filter(l => l !== listener);
    }

    emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
        if (!this.listeners[event]) return;
        this.listeners[event]!.forEach(l => l(...args));
    }
}

// Define the types of messages we can send
export type P2PMessage =
  | { type: 'USER_PROFILE'; payload: { user: User } }
  | { type: 'START_GAME'; payload: { firstPlayerIndex: number; gridData: GridData, wordsToWin: number } }
  | { type: 'GAME_STATE_UPDATE'; payload: FullGameState }
  | { type: 'GAME_OVER'; payload: { winner: Player; finalPlayers: Player[] } }
  | { type: 'CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'ACTION_SELECT_WORD'; payload: { word: string } }
  | { type: 'ACTION_USE_BONUS' }
  | { type: 'FORFEIT' }
  | { type: 'REMATCH_REQUEST' }
  | { type: 'THEME_VOTE'; payload: { theme: string } }
  | { type: 'COIN_FLIP_RESULT'; payload: { result: 'Heads' | 'Tails'; winnerIndex: number; player1Call: 'Heads' | 'Tails' } };

type P2PServiceEvents = {
    'peer-id-generated': (id: string) => void;
    'connection-open': (conn: DataConnection) => void;
    'connection-closed': () => void;
    'data-received': (data: P2PMessage) => void;
    'error': (error: Error) => void;
};

const PEERJS_CONFIG: PeerJSOption = {
    config: {
        'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
        ]
    }
};

class P2PService extends EventEmitter<P2PServiceEvents> {
    public peer: Peer | null = null;
    public connection: DataConnection | null = null;
    public isHost: boolean = false;
    public peerId: string | null = null;

    initializeAsHost() {
        this.isHost = true;
        this.peer = new Peer(PEERJS_CONFIG);

        this.peer.on('open', (id) => {
            this.peerId = id;
            this.emit('peer-id-generated', id);
        });

        this.peer.on('connection', (conn) => {
            if (this.connection) {
                conn.on('open', () => conn.close());
                return;
            }
            this.connection = conn;
            this.setupConnectionListeners();
        });

        this.peer.on('error', (err) => this.emit('error', err));
    }

    initializeAsGuestAndConnect(hostId: string) {
        this.isHost = false;
        this.peer = new Peer(PEERJS_CONFIG);
        this.peerId = null; 

        this.peer.on('open', () => {
             if(!this.peer) return;
            this.connection = this.peer.connect(hostId);
            this.setupConnectionListeners();
        });
        
        this.peer.on('error', (err) => this.emit('error', err));
    }

    private setupConnectionListeners() {
        if (!this.connection) return;

        this.connection.on('open', () => {
             this.emit('connection-open', this.connection!);
        });

        this.connection.on('data', (data) => {
            this.emit('data-received', data as P2PMessage);
        });

        this.connection.on('close', () => {
            this.connection = null;
            this.emit('connection-closed');
        });
        
        this.connection.on('error', (err) => this.emit('error', err));
    }

    sendMessage(data: P2PMessage) {
        if (this.connection && this.connection.open) {
            this.connection.send(data);
        }
    }

    disconnect() {
        this.connection?.close();
        this.peer?.destroy();
        this.peer = null;
        this.connection = null;
        this.peerId = null;
    }
}

export const p2pService = new P2PService();
