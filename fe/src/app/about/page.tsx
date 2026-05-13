import React from 'react';
import styles from './page.module.css';

const stats = [
  { value: '10,000+', label: 'Lượt thi mỗi tháng' },
  { value: '5,000+', label: 'Câu hỏi trong kho' },
  { value: '98%', label: 'Tỷ lệ hài lòng' },
  { value: 'N1–N5', label: 'Tất cả cấp độ JLPT' },
];

const features = [
  {
    icon: '🛡️',
    title: 'Anti-cheat thông minh',
    desc: 'Tự động phát hiện khi thí sinh rời khỏi tab hoặc màn hình, ghi lại log và cảnh báo ngay lập tức.',
  },
  {
    icon: '📊',
    title: 'Phân tích sâu kỹ năng',
    desc: 'Điểm thành phần từng kỹ năng (Từ vựng, Ngữ pháp, Đọc hiểu, Nghe) giúp xác định đúng điểm yếu.',
  },
  {
    icon: '📚',
    title: 'Đề thi chuẩn JLPT',
    desc: 'Hệ thống câu hỏi được cập nhật liên tục, bám sát cấu trúc và độ khó của đề thi chính thức.',
  },
  {
    icon: '⚡',
    title: 'Chấm điểm tức thì',
    desc: 'Kết quả chi tiết ngay sau khi nộp bài. Xem lại đáp án từng câu và giải thích tường tận.',
  },
];

const timeline = [
  { year: '2024', label: 'Ý tưởng hình thành', desc: 'ShikenAI ra đời từ nhu cầu thực tế của người học tiếng Nhật.' },
  { year: '2025', label: 'Ra mắt phiên bản Beta', desc: 'Hệ thống thi thử cơ bản với 1,000+ câu hỏi N3–N5.' },
  { year: '2026', label: 'Mở rộng toàn diện', desc: 'Hỗ trợ N1–N5, tích hợp AI Anti-cheat và phân tích kỹ năng.' },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroBadge}>Về chúng tôi</span>
          <h1 className={styles.heroTitle}>
            Thi thật. Học thật.<br />
            <span className={styles.heroGreen}>Công bằng thật.</span>
          </h1>
          <p className={styles.heroDesc}>
            ShikenAI là nền tảng luyện thi JLPT thế hệ mới — nơi mỗi bài thi
            được bảo đảm tính nghiêm túc như kỳ thi chính thức nhờ công nghệ
            giám sát thông minh và phân tích năng lực chi tiết.
          </p>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <div className={styles.heroCardDots}>
                <span></span><span></span><span></span>
              </div>
              <span className={styles.heroCardLabel}>JLPT N3 · 105 phút</span>
            </div>
            <div className={styles.heroCardBody}>
              <p className={styles.heroCardQuestion}>問 1 &nbsp;次の文の（　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。</p>
              <div className={styles.heroCardOptions}>
                {['について', 'によって', 'にとって', 'において'].map((opt, i) => (
                  <div key={i} className={`${styles.heroCardOpt} ${i === 0 ? styles.heroCardOptSelected : ''}`}>
                    <span className={styles.heroCardOptNum}>{i + 1}</span>
                    <span>{opt}</span>
                    {i === 0 && <span className={styles.heroCardCheck}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.heroCardFooter}>
              <div className={styles.heroCardTimer}>⏱ 01:24:37</div>
              <div className={styles.heroCardProgress}>
                <div className={styles.heroCardProgressBar}>
                  <div className={styles.heroCardProgressFill}></div>
                </div>
                <span>21/60 câu</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statItem}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* Features grid */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Công nghệ cốt lõi</h2>
          <p className={styles.sectionDesc}>Những yếu tố làm nên sự khác biệt của ShikenAI</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className={styles.missionSection}>
        <div className={styles.missionText}>
          <span className={styles.heroBadge}>Sứ mệnh</span>
          <h2 className={styles.missionTitle}>Vì sao chúng tôi xây dựng ShikenAI?</h2>
          <p>
            Nhiều nền tảng thi thử trực tuyến hiện nay không thực sự phản ánh
            năng lực của người học — vì môi trường thi quá thoải mái, thiếu
            áp lực và không kiểm soát được hành vi trong lúc làm bài.
          </p>
          <p>
            Chúng tôi tin rằng <strong>chỉ khi bạn thi nghiêm túc, bạn mới
            biết mình thực sự đang ở đâu</strong>. ShikenAI được tạo ra để
            thu hẹp khoảng cách giữa thi thử và thi thật.
          </p>
        </div>
        <div className={styles.timeline}>
          {timeline.map((t, i) => (
            <div key={i} className={styles.timelineItem}>
              <div className={styles.timelineYear}>{t.year}</div>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>
                <strong>{t.label}</strong>
                <p>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Sẵn sàng bắt đầu luyện thi?</h2>
        <p>Hàng nghìn học viên đã cải thiện điểm số nhờ ShikenAI.</p>
        <a href="/exams" className={styles.ctaBtn}>Xem đề thi ngay →</a>
      </section>

    </div>
  );
}
