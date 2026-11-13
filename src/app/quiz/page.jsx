'use client';

import React, { useEffect, useState } from 'react';

export default function NextQuizPage() {
  const [grouped, setGrouped] = useState({ vocabulary: [], grammar: [], listening: [], mixed: [] });
  const [category, setCategory] = useState('vocabulary');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quiz')
      .then(r => r.json())
      .then(res => {
        if (res?.success && res.data) {
          setGrouped(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const questions = grouped[category] || [];
  const totalAnswered = Object.keys(selectedAnswers).filter(k => k.startsWith(`${category}_`)).length;
  const totalCorrect = questions.reduce((acc, q, idx) => {
    const picked = selectedAnswers[`${category}_${idx}`];
    return picked === q.answer ? acc + 1 : acc;
  }, 0);

  const speakAudio = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 6px', color: '#0f172a' }}>
            <i className="fas fa-circle-question" style={{ color: '#10b981', marginRight: '10px' }}></i>
            Luyện Tập Trắc Nghiệm Phản Xạ (MySQL `quizzes`)
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Chọn đáp án trực tiếp để kiểm tra kết quả tức thì từ ngân hàng câu hỏi MySQL.
          </p>
        </div>
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '10px 18px',
          borderRadius: '12px',
          fontWeight: 800,
          fontSize: '15px'
        }}>
          Điểm hiện tại: {totalCorrect} / {questions.length} ({totalAnswered} đã chọn)
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {[
          { id: 'vocabulary', label: 'Từ Vựng (Vocabulary)', icon: 'fas fa-book' },
          { id: 'grammar', label: 'Ngữ Pháp (Grammar)', icon: 'fas fa-pen-nib' },
          { id: 'listening', label: 'Luyện Nghe (Listening)', icon: 'fas fa-headphones' },
          { id: 'mixed', label: 'Tổng Hợp (Mixed)', icon: 'fas fa-shuffle' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCategory(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: category === tab.id ? '1px solid #2563eb' : '1px solid #cbd5e1',
              background: category === tab.id ? '#2563eb' : '#fff',
              color: category === tab.id ? '#fff' : '#334155',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className={tab.icon}></i>
            <span>{tab.label} ({(grouped[tab.id] || []).length})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải câu hỏi trắc nghiệm từ MySQL...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
          {questions.map((q, idx) => {
            const key = `${category}_${idx}`;
            const picked = selectedAnswers[key];
            const isAnswered = picked !== undefined;

            return (
              <div key={q._id || idx} style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                    Câu {idx + 1}
                  </span>
                  {q.audio && (
                    <button
                      onClick={() => speakAudio(q.audio)}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <i className="fas fa-volume-high"></i> Nghe Audio
                    </button>
                  )}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 14px', lineHeight: 1.4 }}>
                  {q.q}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(q.options || []).map((opt, optIdx) => {
                    let bg = '#f8fafc';
                    let border = '1px solid #e2e8f0';
                    let color = '#334155';

                    if (isAnswered) {
                      if (optIdx === q.answer) {
                        bg = '#dcfce7';
                        border = '1px solid #22c55e';
                        color = '#15803d';
                      } else if (optIdx === picked) {
                        bg = '#fee2e2';
                        border = '1px solid #ef4444';
                        color = '#b91c1c';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => setSelectedAnswers({ ...selectedAnswers, [key]: optIdx })}
                        style={{
                          textAlign: 'left',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: bg,
                          border,
                          color,
                          fontWeight: isAnswered && optIdx === q.answer ? 700 : 500,
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
