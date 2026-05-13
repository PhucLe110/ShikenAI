import React, { useState } from 'react';
import styles from './Flashcard.module.css';

interface FlashcardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  hint?: string;
}

export const Flashcard: React.FC<FlashcardProps> = ({ front, back, hint }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`${styles.cardContainer} ${isFlipped ? styles.flipped : ''}`} 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardFront}>
          <div className={styles.content}>{front}</div>
          {hint && <div className={styles.hint}>Nhấp để xem nghĩa</div>}
        </div>
        <div className={styles.cardBack}>
          <div className={styles.content}>{back}</div>
          <div className={styles.hint}>Nhấp để quay lại</div>
        </div>
      </div>
    </div>
  );
};
