import { GoogleGenAI, Type } from "@google/genai";
import { GridCell, GridData, WordLocation, Direction } from '../types';
import { GRID_SIZE } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const THEMES = [
    'Space Exploration', 'Ancient Mythology', 'Ocean Life', 'Cooking & Baking', 
    'Famous Artists', 'World Capitals', 'Fantasy Creatures', 'Computer Science', 
    'Musical Instruments', 'Sports & Athletics', 'Movie Genres', 'Literary Classics',
    'Weather & Climate', 'In the Garden', 'Types of Vehicles', 'Everyday Electronics',
    'Fruits & Vegetables', 'Office Supplies', 'Astronomy', 'Chemistry Terms'
];

async function generateWords(totalWords: number, theme?: string): Promise<string[]> {
    const selectedTheme = theme || THEMES[Math.floor(Math.random() * THEMES.length)];
    const prompt = `Generate ${totalWords} unique words for a word search puzzle with the theme: '${selectedTheme}'. Words should be between 4 and 8 letters long, suitable for a 10x10 grid. The words must not contain spaces or special characters.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        words: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: 'A single word related to the theme.'
                            }
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text;
        const result = JSON.parse(jsonText);
        
        if (result && Array.isArray(result.words)) {
             return result.words.map((word: string) => word.toUpperCase().replace(/[^A-Z]/g, ''));
        }
        throw new Error("Invalid response format from AI.");

    } catch (error) {
        console.error("Error generating words from Gemini:", error);
        throw new Error("Could not generate puzzle words.");
    }
}

function placeWord(word: string, grid: GridCell[][]): WordLocation | null {
    let attempts = 0;
    while (attempts < 100) {
        const direction: Direction = Math.floor(Math.random() * 3);
        let row: number, col: number;
        
        switch (direction) {
            case Direction.Horizontal:
                row = Math.floor(Math.random() * GRID_SIZE);
                col = Math.floor(Math.random() * (GRID_SIZE - word.length + 1));
                if (canPlace(word, row, col, direction, grid)) {
                    for (let i = 0; i < word.length; i++) {
                        grid[row][col + i] = { letter: word[i], partOfWord: word };
                    }
                    return { text: word, startRow: row, startCol: col, direction, found: false, foundBy: null };
                }
                break;
            case Direction.Vertical:
                row = Math.floor(Math.random() * (GRID_SIZE - word.length + 1));
                col = Math.floor(Math.random() * GRID_SIZE);
                if (canPlace(word, row, col, direction, grid)) {
                    for (let i = 0; i < word.length; i++) {
                        grid[row + i][col] = { letter: word[i], partOfWord: word };
                    }
                    return { text: word, startRow: row, startCol: col, direction, found: false, foundBy: null };
                }
                break;
            case Direction.Diagonal:
                 row = Math.floor(Math.random() * (GRID_SIZE - word.length + 1));
                 col = Math.floor(Math.random() * (GRID_SIZE - word.length + 1));
                 if (canPlace(word, row, col, direction, grid)) {
                     for (let i = 0; i < word.length; i++) {
                         grid[row + i][col + i] = { letter: word[i], partOfWord: word };
                     }
                     return { text: word, startRow: row, startCol: col, direction, found: false, foundBy: null };
                 }
                 break;
        }
        attempts++;
    }
    return null;
}

function canPlace(word: string, row: number, col: number, direction: Direction, grid: GridCell[][]): boolean {
    for (let i = 0; i < word.length; i++) {
        let r = row, c = col;
        if (direction === Direction.Horizontal) c += i;
        else if (direction === Direction.Vertical) r += i;
        else if (direction === Direction.Diagonal) { r += i; c += i; }

        if (grid[r][c].partOfWord && grid[r][c].letter !== word[i]) {
            return false;
        }
    }
    return true;
}

function createGrid(words: string[]): GridData {
    const grid: GridCell[][] = Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => ({ letter: '', partOfWord: undefined }))
    );

    const placedWords: WordLocation[] = [];

    for (const word of words) {
        const placedWord = placeWord(word, grid);
        if (placedWord) {
            placedWords.push(placedWord);
        } else {
            console.warn(`Could not place word: ${word}`);
        }
    }
    
    // Fill empty cells
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (!grid[r][c].letter) {
                grid[r][c].letter = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }

    return { grid, words: placedWords };
}

export const generateWordsAndGrid = async (totalWords: number, theme?: string): Promise<GridData> => {
    const words = await generateWords(totalWords, theme);
    if (words.length < totalWords) {
        throw new Error(`AI only generated ${words.length} words, but ${totalWords} are required.`)
    }
    return createGrid(words);
};