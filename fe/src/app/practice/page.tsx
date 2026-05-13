'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { getPractices, PracticeItem } from '../../services/practiceService';
import { Flashcard } from '../../components/practice/Flashcard';
import { MatchingGame } from '../../components/practice/MatchingGame';

type Mode = 'selection' | 'preview' | 'flashcard' | 'matching' | 'fullList' | 'result';

export default function PracticePage() {
  const router = useRouter();
  const [activeLevel, setActiveLevel] = useState('N5');
  const [mode, setMode] = useState<Mode>('selection');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [data, setData] = useState<PracticeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetMode, setTargetMode] = useState<Mode>('flashcard');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      router.push('/');
      setTimeout(() => {
        window.dispatchEvent(new Event('openAuthModal'));
      }, 100);
      return;
    }
  }, [router]);

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  const skills = [
    { id: 'kanji', name: 'Hán tự (Kanji)', icon: '🏮', description: 'Học cách đọc và ý nghĩa của các chữ Hán.' },
    { id: 'vocab', name: 'Từ vựng (Vocabulary)', icon: '📚', description: 'Ghi nhớ từ vựng qua các ví dụ sinh động.' },
    { id: 'grammar', name: 'Ngữ pháp (Grammar)', icon: '✏️', description: 'Nắm vững cấu trúc câu và cách sử dụng.' },
  ];

  const startPractice = async (skillId: string, practiceMode: Mode) => {
    setLoading(true);
    try {
      const items = await getPractices({ 
        type: skillId, 
        level: activeLevel, 
        limit: practiceMode === 'fullList' ? 5000 : 10, 
        random: practiceMode !== 'fullList' 
      });
      setData(items);
      setSelectedSkill(skillId);
      if (practiceMode === 'fullList') {
        setMode('fullList');
        setCurrentPage(1);
      } else {
        setTargetMode(practiceMode);
        setMode('preview');
      }
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching practices:', error);
      alert('Không thể tải dữ liệu luyện tập. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setMode('result');
    }
  };

  if (mode === 'preview' && data.length > 0) {
    return (
      <div className={styles.practiceSession}>
        <button className={styles.btnBack} onClick={() => setMode('selection')}>← Quay lại</button>
        <div className={styles.sessionHeader}>
          <h2>Xem trước kiến thức - {activeLevel}</h2>
          <p>Hãy xem qua các từ vựng/ngữ pháp này trước khi bắt đầu luyện tập.</p>
        </div>

        <div className={styles.previewList}>
          {data.map((item, idx) => (
            <div key={item._id} className={styles.previewItem}>
              <div className={styles.previewIndex}>{idx + 1}</div>
              <div className={styles.previewContent}>
                <div className={styles.previewMain}>{item.title} {item.reading && <small>({item.reading})</small>}</div>
                <div className={styles.previewMeaning}>{item.meaning.vn}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.sessionFooter}>
          <button className={styles.btnStart} onClick={() => setMode(targetMode)}>
            Bắt đầu {targetMode === 'flashcard' ? 'Flashcards' : 'Trò chơi'}
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'flashcard' && data.length > 0) {
    const item = data[currentIndex];
    return (
      <div className={styles.practiceSession}>
        <button className={styles.btnBack} onClick={() => setMode('selection')}>← Quay lại</button>
        <div className={styles.sessionHeader}>
          <h2>{skills.find(s => s.id === selectedSkill)?.name} - {activeLevel}</h2>
          <p>Thẻ {currentIndex + 1} / {data.length}</p>
        </div>
        
        <Flashcard 
          front={
            <div className={styles.cardContent}>
              <span className={styles.jpText}>{item.title}</span>
              {item.reading && <span className={styles.reading}>{item.reading}</span>}
            </div>
          }
          back={
            <div className={styles.cardContent}>
              <span className={styles.meaning}>{item.meaning.vn}</span>
              {item.hanviet && <span className={styles.hanviet}>Hán Việt: {item.hanviet}</span>}
              {item.category && <span className={styles.category}>Loại: {item.category}</span>}
            </div>
          }
          hint="Chạm để lật thẻ"
        />

        <div className={styles.sessionFooter}>
          <button className={styles.btnNext} onClick={handleNext}>
            {currentIndex === data.length - 1 ? 'Hoàn thành' : 'Thẻ tiếp theo'}
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'fullList' && data.length > 0) {
    const totalPages = Math.ceil(data.length / pageSize);
    const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
      <div className={styles.practiceSession}>
        <button className={styles.btnBack} onClick={() => setMode('selection')}>← Quay lại</button>
        <div className={styles.sessionHeader}>
          <h2>Danh sách kiến thức - {skills.find(s => s.id === selectedSkill)?.name} {activeLevel}</h2>
          <p>Trang {currentPage} / {totalPages} ({data.length} mục)</p>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.knowledgeTable}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tiếng Nhật</th>
                <th>Ý nghĩa</th>
                {selectedSkill === 'kanji' && <th>Hán Việt</th>}
                {selectedSkill === 'grammar' && <th>Loại</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, idx) => (
                <tr key={item._id}>
                  <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className={styles.jpCell}>
                    <strong>{item.title}</strong>
                    {item.reading && <div className={styles.readingSub}>{item.reading}</div>}
                  </td>
                  <td>{item.meaning.vn}</td>
                  {selectedSkill === 'kanji' && <td>{item.hanviet}</td>}
                  {selectedSkill === 'grammar' && <td>{item.category}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)}
            className={styles.pageBtn}
          >
            ← Trang trước
          </button>
          <span className={styles.pageInfo}>Trang {currentPage} / {totalPages}</span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(currentPage + 1)}
            className={styles.pageBtn}
          >
            Trang sau →
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'matching' && data.length > 0) {
    return (
      <div className={styles.practiceSession}>
        <button className={styles.btnBack} onClick={() => setMode('selection')}>← Quay lại</button>
        <div className={styles.sessionHeader}>
          <h2>Trò chơi nối từ - {activeLevel}</h2>
          <p>Hãy nối các cặp từ tiếng Nhật và nghĩa tiếng Việt tương ứng.</p>
        </div>
        
        <MatchingGame 
          data={data} 
          onComplete={() => setMode('result')} 
        />
      </div>
    );
  }

  if (mode === 'result') {
    return (
      <div className={styles.practiceSession}>
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>🎉</div>
          <h2 className={styles.resultTitle}>Tuyệt vời!</h2>
          <p className={styles.resultText}>
            Bạn đã hoàn thành phiên luyện tập <strong>{skills.find(s => s.id === selectedSkill)?.name}</strong> cấp độ <strong>{activeLevel}</strong>.
          </p>
          <div className={styles.resultButtons}>
            <button 
              className={styles.btnContinue} 
              onClick={() => startPractice(selectedSkill!, targetMode)}
            >
              Tiếp tục luyện tập
            </button>
            <button 
              className={styles.btnBackHome} 
              onClick={() => setMode('selection')}
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Luyện tập tiếng Nhật</h1>
        <p className={styles.subtitle}>
          Hơn 13,000 bài tập Kanji, Từ vựng và Ngữ pháp đang chờ bạn khám phá.
        </p>
      </div>

      <div className={styles.levelSelector}>
        <span className={styles.label}>Chọn cấp độ:</span>
        <div className={styles.levelTabs}>
          {levels.map(level => (
            <button 
              key={level}
              className={`${styles.levelBtn} ${activeLevel === level ? styles.activeLevel : ''}`}
              onClick={() => setActiveLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      ) : (
        <div className={styles.skillsGrid}>
          {skills.map(skill => (
            <div key={skill.id} className={styles.skillCard}>
              <div className={styles.skillHeader}>
                <div className={styles.skillIcon}>{skill.icon}</div>
                <div>
                  <h3 className={styles.skillName}>{skill.name}</h3>
                  <p className={styles.skillDescription}>{skill.description}</p>
                </div>
              </div>
              
              <div className={styles.actionButtons}>
                <button 
                  className={styles.btnPractice} 
                  onClick={() => startPractice(skill.id, 'flashcard')}
                >
                  🎴 Flashcards
                </button>
                <button 
                  className={styles.btnGame} 
                  onClick={() => startPractice(skill.id, 'matching')}
                >
                  🧩 Nối từ
                </button>
                <button 
                  className={styles.btnAll} 
                  onClick={() => startPractice(skill.id, 'fullList')}
                >
                  📖 Xem tất cả
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.infoBanner}>
        <div className={styles.infoIcon}>💡</div>
        <div className={styles.infoContent}>
          <h3>Mẹo học tập</h3>
          <p>Luyện tập ít nhất 15 phút mỗi ngày với Flashcards giúp tăng khả năng ghi nhớ từ vựng lên đến 80%.</p>
        </div>
      </div>
    </div>
  );
}
