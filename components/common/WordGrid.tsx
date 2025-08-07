
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GridData, Direction, CellCoord } from '../../types';
import { GRID_SIZE } from '../../constants';

interface WordGridProps {
  gridData: GridData;
  onWordSelected: (word: string) => void;
  turnResult: 'success' | 'fail' | null;
  revealWords: boolean;
  isTurnActive: boolean;
  hintedCell: CellCoord | null;
}

const getLineCoords = (start: CellCoord, end: CellCoord): CellCoord[] => {
    const coords: CellCoord[] = [];
    let { row: x0, col: y0 } = start;
    const { row: x1, col: y1 } = end;

    const dx = x1 - x0;
    const dy = y1 - y0;
    
    const sx = Math.sign(dx);
    const sy = Math.sign(dy);
    
    // Horizontal line
    if (dx !== 0 && dy === 0) {
        for(let i=0; i <= Math.abs(dx); i++) {
            coords.push({ row: x0 + i * sx, col: y0 });
        }
        return coords;
    }
    // Vertical line
    if (dy !== 0 && dx === 0) {
        for(let i=0; i <= Math.abs(dy); i++) {
            coords.push({ row: x0, col: y0 + i * sy });
        }
        return coords;
    }
    // Diagonal line
    if (Math.abs(dx) === Math.abs(dy) && dx !== 0) {
        for(let i=0; i <= Math.abs(dx); i++) {
            coords.push({ row: x0 + i * sx, col: y0 + i * sy });
        }
        return coords;
    }

    // If it's not a straight line or just a single point, return only the starting cell.
    return [start];
}

const WordGrid: React.FC<WordGridProps> = ({ gridData, onWordSelected, turnResult, revealWords, isTurnActive, hintedCell }) => {
  const [selectedCells, setSelectedCells] = useState<CellCoord[]>([]);
  const [failedSelection, setFailedSelection] = useState<CellCoord[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  
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
      const cellSet = new Set<string>();
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
  
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTurnActive || !gridRef.current) return;
    gridRef.current.releasePointerCapture(e.pointerId);

    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor((x / rect.width) * GRID_SIZE);
    const row = Math.floor((y / rect.height) * GRID_SIZE);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        setIsSelecting(true);
        setSelectedCells([{ row, col }]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSelecting || !gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor((x / rect.width) * GRID_SIZE);
    const row = Math.floor((y / rect.height) * GRID_SIZE);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        const startCell = selectedCells[0];
        if (!startCell) return;
      
        const endCell = { row, col };
        const lineCoords = getLineCoords(startCell, endCell);
        setSelectedCells(lineCoords);
    }
  };

  const handlePointerUp = useCallback(() => {
    if (!isSelecting) return;
    setIsSelecting(false);

    if (selectedCells.length < 2) {
      setSelectedCells([]);
      return;
    }
    
    const sortedSelected = [...selectedCells].sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);

    let matchFound = false;
    for (const word of gridData.words) {
      if (word.found || word.text.length !== sortedSelected.length) continue;

      const wordCoords: CellCoord[] = Array.from({ length: word.text.length }, (_, i) => {
        let r = word.startRow, c = word.startCol;
        if (word.direction === Direction.Horizontal) c += i;
        else if (word.direction === Direction.Vertical) r += i;
        else if (word.direction === Direction.Diagonal) { r += i; c += i; }
        return { row: r, col: c };
      });

      const sortedWordCoords = wordCoords.sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);

      if (sortedSelected.every((cell, index) => cell.row === sortedWordCoords[index].row && cell.col === sortedWordCoords[index].col)) {
          onWordSelected(word.text);
          matchFound = true;
          break;
      }
    }
    
    if (!matchFound) {
       setFailedSelection(selectedCells);
       setTimeout(() => setFailedSelection([]), 500);
       setSelectedCells([]);
    }
  }, [isSelecting, selectedCells, gridData, onWordSelected]);

  const getCellClasses = (row: number, col: number) => {
    const coordString = `${row}-${col}`;
    const isFound = foundCells.has(coordString);
    const isPartOfAnyWord = allWordCells.has(coordString);
    const isSelected = selectedCells.some(c => c.row === row && c.col === col);
    const isFailed = failedSelection.some(c => c.row === row && c.col === col);
    const isRevealed = revealWords && isPartOfAnyWord && !isFound;
    const isHint = hintedCell && hintedCell.row === row && hintedCell.col === col;
    
    let cellClass = 'fw-bold rounded user-select-none';
    
    if (turnResult === 'success' && isSelected) cellClass += ' bg-success text-white border-2 border-white z-1 animate-pulse';
    else if (turnResult === 'fail' && isSelected) cellClass += ' bg-danger text-white z-1 animate-pulse';
    else if (isFailed) cellClass += ' animate-shake bg-danger bg-opacity-75';
    else if (isFound) cellClass += ' bg-primary bg-opacity-75 text-white';
    else if (isSelected) cellClass += ' bg-warning text-black scale-110 z-1';
    else if (isHint) cellClass += ' bg-info bg-opacity-50 border-2 border-info animate-pulse';
    else if (isRevealed) cellClass += ' bg-secondary bg-opacity-50';
    else cellClass += ' bg-secondary bg-opacity-25 text-light';
    
    if (isTurnActive) cellClass += ' cursor-pointer';

    return cellClass;
  };

  return (
    <div
      ref={gridRef}
      className={`d-grid gap-1 bg-black bg-opacity-25 p-2 rounded-3 w-100 ${!isTurnActive ? 'cursor-not-allowed opacity-75' : ''}`}
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, touchAction: 'none', maxWidth: '500px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {gridData.grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="ratio ratio-1x1"
          >
            <span className={`d-flex align-items-center justify-content-center w-100 h-100 fs-6 fs-sm-5 fs-md-4 ${getCellClasses(rowIndex, colIndex)}`}>
                {cell.letter}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default WordGrid;