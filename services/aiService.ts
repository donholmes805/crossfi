import { GoogleGenAI } from "@google/genai";
import { User, Player, ChatEventType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getPersonality = (aiPlayer: User): string => {
    if (aiPlayer.name === 'Recruit') return 'a friendly but slightly nervous rookie. You are encouraging and impressed by the player.';
    if (aiPlayer.name === 'Veteran') return 'a seasoned, professional soldier. You are calm, focused, and respectful but confident.';
    if (aiPlayer.name === 'Commando') return 'a cocky, elite, and arrogant commando. You love to taunt and show off.';
    return 'a standard AI opponent.';
};

const getEventDescription = (eventType: ChatEventType, humanPlayer: Player, aiPlayer: Player): string => {
    switch (eventType) {
        case ChatEventType.GameStart:
            return `The game against ${humanPlayer.name} is starting. Wish them luck, in character.`;
        case ChatEventType.PlayerFoundWord:
            return `The human player, ${humanPlayer.name}, just found a word. Their score is now ${humanPlayer.score}. Your score is ${aiPlayer.score}. React to this.`;
        case ChatEventType.AiFoundWord:
            return `You just found a word. Your score is now ${aiPlayer.score}. The player's score is ${humanPlayer.score}. Say something triumphant or cocky.`;
        case ChatEventType.AiStealTurn:
            return `You now have a chance to "steal" and win the game instantly because the player failed their turn. Express your confidence.`;
        default:
            return 'Something happened in the game.';
    }
}

export const generateAiChatMessage = async (
    aiPlayer: Player,
    humanPlayer: Player,
    eventType: ChatEventType
): Promise<string> => {
    // Don't always send a message, make it feel more natural
    if (Math.random() > 0.65) { // 65% chance to send a message on an event
        return '';
    }
    
    const personality = getPersonality(aiPlayer);
    const eventDescription = getEventDescription(eventType, humanPlayer, aiPlayer);
    
    const systemInstruction = `You are an AI opponent in a word search game called CrossFiWord Wars. Your name is ${aiPlayer.name}. You are ${personality}. All responses must be short, punchy, in-character, and under 15 words. Never use hashtags or quotation marks.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: eventDescription,
            config: {
                systemInstruction,
                // Disable thinking for faster, more impulsive chat messages
                thinkingConfig: { thinkingBudget: 0 },
                temperature: 0.9,
            }
        });

        const text = response.text.trim();
        // Basic sanitization, remove quotes that the model might add
        return text.replace(/["“”]/g, '');

    } catch (error) {
        console.error("Error generating AI chat message:", error);
        return ''; // Don't block the game on chat failure
    }
};