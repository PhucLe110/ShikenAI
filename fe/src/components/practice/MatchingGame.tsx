import React, { useState, useEffect } from 'react';
import styles from './MatchingGame.module.css';
import { PracticeItem } from '../../services/practiceService';

interface MatchingGameProps {
  data: PracticeItem[];
  onComplete: () => void;
}

interface Tile {
  id: string;
  text: string;
  type: 'jp' | 'vn';
  matchId: string;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ data, onComplete }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selected, setSelected] = useState<Tile | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);

  useEffect(() => {
    // Prepare tiles
    const jpTiles: Tile[] = data.map(item => ({
      id: `jp-${item._id}`,
      text: item.type === 'kanji' ? item.title : (item.reading || item.title),
      type: 'jp',
      matchId: item._id
    }));

    const vnTiles: Tile[] = data.map(item => ({
      id: `vn-${item._id}`,
      text: item.meaning.vn,
      type: 'vn',
      matchId: item._id
    }));

    setTiles([...jpTiles, ...vnTiles].sort(() => Math.random() - 0.5));
  }, [data]);

  const handleTileClick = (tile: Tile) => {
    if (matchedIds.includes(tile.matchId)) return;
    if (selected?.id === tile.id) {
      setSelected(null);
      return;
    }

    if (!selected) {
      setSelected(tile);
    } else {
      // Check for match
      if (selected.type !== tile.type && selected.matchId === tile.matchId) {
        // Success
        setMatchedIds([...matchedIds, tile.matchId]);
        setSelected(null);
      } else {
        // Wrong
        setWrongId(tile.id);
        setTimeout(() => {
          setWrongId(null);
          setSelected(null);
        }, 500);
      }
    }
  };

  useEffect(() => {
    if (matchedIds.length === data.length && data.length > 0) {
      setTimeout(onComplete, 1000);
    }
  }, [matchedIds, data.length, onComplete]);

  return (
    <div className={styles.gameContainer}>
      <div className={styles.grid}>
        {tiles.map(tile => (
          <button
            key={tile.id}
            className={`
              ${styles.tile} 
              ${selected?.id === tile.id ? styles.selected : ''} 
              ${matchedIds.includes(tile.matchId) ? styles.matched : ''}
              ${wrongId === tile.id ? styles.wrong : ''}
            `}
            onClick={() => handleTileClick(tile)}
            disabled={matchedIds.includes(tile.matchId)}
          >
            {tile.text}
          </button>
        ))}
      </div>
    </div>
  );
};
