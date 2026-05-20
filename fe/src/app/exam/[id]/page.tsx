"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Avatar from "@/components/Avatar";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import api from "@/services/api";

export default function ExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id: examId } = params;
  const {
    warnings,
    isTerminated,
    showWarningModal,
    acknowledgeWarning,
    maxWarnings,
  } = useAntiCheat(examId);

  const [examData, setExamData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string } | null>(null);

  // Custom modals state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState<any>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);

  // Ref để lấy timeLeft mới nhất trong async handlers
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // ── Auth check ───────────────────────────────────────────────────────────
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    } else {
      alert("Vui lòng đăng nhập để làm bài");
      router.push("/");
    }
  }, [router]);

  // ── Load exam + check saved progress ────────────────────────────────────
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const { data } = await api.get(`/exams/${examId}`);
        setExamData(data);
        setTimeLeft(data.duration * 60);

        // Kiểm tra có tiến độ đang dở không
        try {
          const { data: progress } = await api.get(`/exams/${examId}/progress`);
          setSavedProgress(progress);
          setShowResumeModal(true); // Hỏi user muốn tiếp tục hay làm mới
        } catch {
          // Không có tiến độ — bắt đầu mới, không làm gì
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        alert("Không tìm thấy đề thi hoặc bạn không có quyền truy cập");
        router.push("/");
      }
    };
    if (user) fetchExam();
  }, [examId, user, router]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || isTerminated) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isTerminated]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = (optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIdx }));
  };

  const totalQuestions = examData?.questions?.length ?? 0;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const allAnswered = unansweredCount === 0;

  // ── Resume modal actions ─────────────────────────────────────────────────
  const handleResume = () => {
    if (!savedProgress) return;
    // Restore answers
    const restored: Record<number, number> = {};
    if (savedProgress.answers instanceof Map) {
      savedProgress.answers.forEach((v: number, k: string) => {
        restored[Number(k)] = v;
      });
    } else {
      Object.entries(savedProgress.answers).forEach(([k, v]) => {
        restored[Number(k)] = v as number;
      });
    }
    setAnswers(restored);
    setTimeLeft(savedProgress.timeLeft ?? examData.duration * 60);
    setShowResumeModal(false);
  };

  const handleStartFresh = () => {
    setAnswers({});
    setTimeLeft(examData.duration * 60);
    setShowResumeModal(false);
  };

  // ── Pause ────────────────────────────────────────────────────────────────
  const handlePause = async () => {
    setIsPausing(true);
    try {
      const currentTimeLeft = timeLeftRef.current;
      const timeSpent = examData.duration * 60 - Math.max(0, currentTimeLeft);
      await api.post(`/exams/${examId}/save-progress`, {
        answers,
        timeLeft: currentTimeLeft,
        timeSpent,
      });
      router.push("/exams");
    } catch (error) {
      console.error("Lỗi khi lưu tiến độ:", error);
      alert("Có lỗi khi lưu tiến độ. Vui lòng thử lại.");
      setIsPausing(false);
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const submitExam = async (isAutoSubmit = false) => {
    setIsSubmitting(true);
    setShowSubmitModal(false);
    setIsSubmitError(false);
    try {
      const timeSpent =
        examData.duration * 60 - Math.max(0, timeLeftRef.current);
      const response = await api.post(`/exams/${examId}/submit`, {
        answers,
        timeSpent,
      });
      setIsSubmitError(false);
      setSubmitMessage(
        isAutoSubmit
          ? "Hết giờ! Hệ thống đã tự động nộp bài."
          : "Nộp bài thành công!",
      );
      setTimeout(() => {
        router.push(`/result/${response.data._id}`);
      }, 1500);
    } catch (error: any) {
      console.error("Lỗi khi nộp bài:", error);
      setIsSubmitError(true);
      setSubmitMessage(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.",
      );
      setIsSubmitting(false);
    }
  };

  // ── Auto-submit khi hết giờ ──────────────────────────────────────────────
  useEffect(() => {
    if (examData && timeLeft === 0 && !isTerminated && !loading) {
      submitExam(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isTerminated, examData, loading]);

  // ── Loading / Terminated ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Đang tải đề thi...
      </div>
    );
  }

  if (isTerminated) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalIcon}>❌</div>
          <h2 className={styles.modalTitle}>Bài thi đã kết thúc</h2>
          <p className={styles.modalText}>
            Bạn đã vi phạm nội quy quá {maxWarnings} lần (Rời khỏi màn hình làm
            bài).
          </p>
          <button className={styles.modalBtn} onClick={() => router.push("/")}>
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const currentQ = examData.questions[currentQuestionIndex];
  const timerDanger = timeLeft < 300; // Dưới 5 phút → đỏ

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.logo}>⛩️ ShikenAI</div>
        <div>{examData.title}</div>

        <div
          className={`${styles.timer} ${timerDanger ? styles.timerDanger : ""}`}
        >
          ⏱️ {formatTime(timeLeft)}
        </div>

        {warnings > 0 && (
          <div
            className={`${styles.warningBadge} ${warnings >= 2 ? styles.danger : ""}`}
          >
            ⚠️ Warning: {warnings}/{maxWarnings}
          </div>
        )}

        {/* Nút Tạm dừng */}
        <button
          className={styles.btnPause}
          onClick={() => setShowPauseModal(true)}
          disabled={isPausing}
        >
          ⏸ Tạm dừng
        </button>

        <div className={styles.userProfile}>
          <Avatar name={user?.name} size={40} />
          <span>{user?.name || "Thí sinh"}</span>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className={styles.content}>
        {/* Question Palette */}
        <div className={styles.palette}>
          <div className={styles.paletteTitle}>
            <span>Câu hỏi</span>
            <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              {totalQuestions} câu
            </span>
          </div>
          <div className={styles.grid}>
            {examData.questions.map((_: any, idx: number) => (
              <button
                key={idx}
                className={`${styles.questionBtn} ${answers[idx] !== undefined ? styles.answered : ""} ${currentQuestionIndex === idx ? styles.active : ""}`}
                onClick={() => setCurrentQuestionIndex(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {answeredCount}/{totalQuestions} câu đã làm
            </span>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={`${styles.dot} ${styles.done}`}></div> Đã làm
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.dot} ${styles.todo}`}></div> Chưa làm
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className={styles.mainSection}>
          <h3 className={styles.questionTitle}>
            Câu {currentQuestionIndex + 1}
          </h3>
          <div className={styles.questionText}>
            {currentQ?.text.split("\n").map((line: string, i: number) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          <div className={styles.options}>
            {currentQ?.options.map((opt: string, idx: number) => (
              <label key={idx} className={styles.optionLabel}>
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  checked={answers[currentQuestionIndex] === idx}
                  onChange={() => handleSelectAnswer(idx)}
                />
                <span style={{ width: "24px", display: "inline-block" }}>
                  {idx + 1}
                </span>
                <span>{opt}</span>
              </label>
            ))}
          </div>

          <div className={styles.actions}>
            <button
              className={styles.btnSecondary}
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestionIndex === 0}
            >
              Quay lại
            </button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <div className={styles.submitWrap}>
                {!allAnswered && (
                  <span className={styles.submitHint}>
                    ⚠️ Còn {unansweredCount} câu chưa trả lời
                  </span>
                )}
                <button
                  className={`${styles.btnPrimary} ${styles.btnSubmit}`}
                  onClick={() => setShowSubmitModal(true)}
                  disabled={!allAnswered}
                  title={
                    !allAnswered
                      ? `Còn ${unansweredCount} câu chưa trả lời`
                      : "Nộp bài"
                  }
                >
                  Nộp bài
                </button>
              </div>
            ) : (
              <button
                className={styles.btnPrimary}
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              >
                Câu tiếp theo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal: Tiếp tục hay làm mới? ── */}
      {showResumeModal && savedProgress && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon} style={{ color: "#f59e0b" }}>
              💾
            </div>
            <h2 className={styles.modalTitle}>Bạn có bài làm dở!</h2>
            <p className={styles.modalText}>
              Bạn đã làm được{" "}
              <strong>
                {Object.keys(savedProgress.answers ?? {}).length}/
                {savedProgress.totalQuestions}
              </strong>{" "}
              câu.
              <br />
              Thời gian còn lại:{" "}
              <strong>{formatTime(savedProgress.timeLeft ?? 0)}</strong>
              <br />
              <br />
              Bạn muốn tiếp tục hay bắt đầu lại?
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                className={styles.btnSecondary}
                style={{ flex: 1 }}
                onClick={handleStartFresh}
              >
                Làm lại
              </button>
              <button
                className={styles.btnPrimary}
                style={{ flex: 1 }}
                onClick={handleResume}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Xác nhận tạm dừng ── */}
      {showPauseModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon} style={{ color: "#6366f1" }}>
              ⏸
            </div>
            <h2 className={styles.modalTitle}>Tạm dừng bài làm?</h2>
            <p className={styles.modalText}>
              Tiến độ của bạn sẽ được lưu lại. Thời gian còn lại cũng sẽ được
              lưu để tiếp tục sau.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                className={styles.btnSecondary}
                style={{ flex: 1 }}
                onClick={() => setShowPauseModal(false)}
              >
                Tiếp tục làm
              </button>
              <button
                className={`${styles.btnPrimary} ${styles.btnPauseConfirm}`}
                style={{ flex: 1 }}
                onClick={() => {
                  setShowPauseModal(false);
                  handlePause();
                }}
              >
                {isPausing ? "Đang lưu..." : "Lưu & Tạm dừng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Anti-cheat warning ── */}
      {showWarningModal && !isTerminated && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>⚠️</div>
            <h2 className={styles.modalTitle}>Bạn đã rời khỏi màn hình!</h2>
            <p className={styles.modalText}>
              Vui lòng quay lại bài thi. <br />
              Nếu tiếp tục vi phạm, bạn sẽ bị tính là gian lận.
            </p>
            <span className={styles.warningCount}>
              Cảnh báo: {warnings}/{maxWarnings}
            </span>
            <button className={styles.modalBtn} onClick={acknowledgeWarning}>
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: Xác nhận nộp bài ── */}
      {showSubmitModal && !isSubmitting && !submitMessage && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon} style={{ color: "#3b82f6" }}>
              ✅
            </div>
            <h2 className={styles.modalTitle}>Xác nhận nộp bài</h2>
            <p className={styles.modalText}>
              Bạn đã hoàn thành <strong>tất cả {totalQuestions} câu</strong>.
              <br />
              Sau khi nộp sẽ không thể thay đổi đáp án.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                className={styles.btnSecondary}
                style={{ flex: 1 }}
                onClick={() => setShowSubmitModal(false)}
              >
                Hủy
              </button>
              <button
                className={`${styles.btnPrimary} ${styles.btnSubmit}`}
                style={{ flex: 1 }}
                onClick={() => submitExam(false)}
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Đang xử lý / Kết quả submit ── */}
      {(isSubmitting || submitMessage) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              {!submitMessage ? "⏳" : isSubmitError ? "❌" : "✅"}
            </div>
            <h2 className={styles.modalTitle}>
              {!submitMessage
                ? "Đang xử lý"
                : isSubmitError
                  ? "Có lỗi xảy ra"
                  : "Thành công"}
            </h2>
            <p className={styles.modalText}>
              {submitMessage || "Đang nộp bài..."}
            </p>
            {submitMessage && isSubmitError && (
              <button
                className={styles.modalBtn}
                onClick={() => {
                  setSubmitMessage("");
                  setIsSubmitError(false);
                }}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
