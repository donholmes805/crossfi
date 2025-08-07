import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GridData, Direction, WordLocation } from '../../types';
import { GRID_SIZE } from '../../constants';

interface WordGridProps {
  gridData: GridData;
  onWordSelected: (word: string) => void;
  turnResult: 'success' | 'fail' | null;
  revealWords: boolean;
  activePlayerId: string;
  isTurnActive: boolean;
}

interface CellCoord {
    row: number;
    col: number;
}

const WordGrid: React.FC<WordGridProps> = ({ gridData, onWordSelected, turnResult, revealWords, isTurnActive }) => {
  const [selectedCells, setSelectedCells] = useState<CellCoord[]>([]);
  const [failedSelection, setFailedSelection] = useState<CellCoord[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  
  const foundCells = useMemo(() => {
    const cellSet = new Set<string>(); // "row-col"
    gridData.words.forEach(word => {
        if (word.found) {
            for (let i = 0; i < word.text.length; i++) {
                let r = word.startRow;
                let c = word.startCol;
                if (word.direction === Direction.Horizontal) c += i;
                else if (word.direction === Direction.Vertical) r += i;
                else if (word.direction === Direction.Diagonal) { r += i; c += i; }
                cellSet.add(`${r}-${c}`);
            }
        }
    });
    return cellSet;
  }, [gridData.words]);

  const allWordCells = useMemo(() => {
      const cellSet = new Set<string>(); // "row-col"
      gridData.words.forEach(word => {
          for (let i = 0; i < word.text.length; i++) {
              let r = word.startRow;
              let c = word.startCol;
              if (word.direction === Direction.Horizontal) c += i;
              else if (word.direction === Direction.Vertical) r += i;
              else if (word.direction === Direction.Diagonal) { r += i; c += i; }
              cellSet.add(`${r}-${c}`);
          }
      });
      return cellSet;
  }, [gridData.words]);
  
  useEffect(() => {
    if(turnResult !== null) {
      if(turnResult !== 'success' && turnResult !== 'fail') {
         setSelectedCells([]);
      }
    } else {
        setSelectedCells([]);
    }
  }, [turnResult]);
  
  const handlePointerDown = (e: React.PointerEvent, row: number, col: number) => {
    if (!isTurnActive) return;
    e.currentTarget.releasePointerCapture(e.pointerId); // Allows continuing selection outside of the initial element
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handlePointerMove = (e: React.PointerEvent, row: number, col: number) => {
    if (!isSelecting) return;
    
    // Basic validation to prevent jumping across the grid
    const lastCell = selectedCells[selectedCells.length - 1];
    if (lastCell && (Math.abs(lastCell.row - row) > 1 || Math.abs(lastCell.col - col) > 1)) {
        return;
    }
    
    setSelectedCells(prev => {
        if (prev.find(c => c.row === row && c.col === col)) return prev;
        return [...prev, { row, col }];
    });
  };

  const handlePointerUp = useCallback(() => {
    if (!isSelecting) return;
    if (selectedCells.length < 2) {
      setIsSelecting(false);
      setSelectedCells([]);
      return;
    }
    
    setIsSelecting(false);

    const sortedSelected = [...selectedCells].sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
    });

    let matchFound = false;
    for (const word of gridData.words) {
      if (word.found || word.text.length !== sortedSelected.length) continue;

      const wordCoords: CellCoord[] = [];
      for (let i = 0; i < word.text.length; i++) {
          let r = word.startRow;
          let c = word.startCol;
          if (word.direction === Direction.Horizontal) c += i;
          else if (word.direction === Direction.Vertical) r += i;
          else if (word.direction === Direction.Diagonal) { r += i; c += i; }
          wordCoords.push({ row: r, col: c });
      }

      const sortedWordCoords = wordCoords.sort((a, b) => {
          if (a.row !== b.row) return a.row - b.row;
          return a.col - b.col;
      });

      const isMatch = sortedSelected.every((cell, index) => 
          cell.row === sortedWordCoords[index].row && cell.col === sortedWordCoords[index].col
      );

      if (isMatch) {
          onWordSelected(word.text);
          matchFound = true;
          break;
      }
    }
    
    if (!matchFound) {
       setFailedSelection(selectedCells);
       setTimeout(() => setFailedSelection([]), 500); // Shake animation is 500ms
       setSelectedCells([]);
    }
  }, [isSelecting, selectedCells, gridData, onWordSelected]);

  const getCellState = (row: number, col: number) => {
    const coordString = `${row}-${col}`;
    const isFound = foundCells.has(coordString);
    const isPartOfAnyWord = allWordCells.has(coordString);
    
    return {
        isFound,
        isRevealed: revealWords && isPartOfAnyWord && !isFound,
        isSelected: selectedCells.some(c => c.row === row && c.col === col),
        isFailed: failedSelection.some(c => c.row === row && c.col === col),
    };
  };

  return (
    <div
      className={`relative grid gap-1 bg-black/30 p-2 rounded-lg touch-none w-full max-w-lg ${!isTurnActive ? 'cursor-not-allowed opacity-75' : ''}`}
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {gridData.grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const state = getCellState(rowIndex, colIndex);
          
          let cellClass = 'aspect-square flex items-center justify-center font-bold text-xs sm:text-sm md:text-base rounded-md transition-all duration-150 relative select-none ';
          
          if (turnResult === 'success' && state.isSelected) {
             cellClass += 'animate-pulse bg-green-500 text-white ring-2 ring-white z-10';
          } else if (turnResult === 'fail' && state.isSelected) {
             cellClass += 'animate-pulse bg-red-500 text-white z-10';
          } else if (state.isFailed) {
             cellClass += 'animate-shake bg-red-500/80';
          } else if (state.isFound) {
            cellClass += 'bg-blue-600/80 text-white ';
          } else if (state.isSelected) {
            cellClass += 'bg-yellow-400 text-black scale-110 z-10 ';
          } else if (state.isRevealed) {
            cellClass += 'bg-purple-900/70 text-purple-200 ';
          } else {
            cellClass += 'bg-slate-800/80 text-slate-200 shadow-md ';
             if (isTurnActive) cellClass += 'hover:bg-slate-700/80 ';
          }
          
          if(isTurnActive) cellClass += 'cursor-pointer';

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cellClass}
              onPointerDown={(e) => handlePointerDown(e, rowIndex, colIndex)}
              onPointerMove={(e) => handlePointerMove(e, rowIndex, colIndex)}
            >
              {cell.letter}
            </div>
          );
        })
      )}
    </div>
  );
};

export default WordGrid;