'use client';

import React, { useEffect, useState } from 'react';

export default function NextITAcademyPage() {
  const [itCourses, setItCourses] = useState([]);
  const [itTerms, setItTerms] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/it/courses').then(r => r.json()).catch(() => null),
      fetch('/api/it/terms').then(r => r.json()).catch(() => null)
    ]).then(([resCourses, resTerms]) => {
      if (resCourses?.success && Array.isArray(resCourses.data)) {
        setItCourses(resCourses.data);
        if (resCourses.data.length > 0) setSelectedModule(resCourses.data[0]);
      }
      if (resTerms?.success && Array.isArray(resTerms.data)) {
        setItTerms(resTerms.data);
      }
      setLoading(false);
    });
  }, []);

  const speakTerm = (word) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 6px', color: '#0f172a' }}>
          <i className="fas fa-laptop-code" style={{ color: '#0284c7', marginRight: '10px' }}></i>
          Học Viện CNTT & Tiếng Anh Chuyên Ngành (MySQL `it_courses`)
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Lộ trình đào tạo kỹ sư phần mềm song ngữ kèm code mẫu và kho thuật ngữ IT thực chiến.
        </p>
      </div>

      {/* Module Selector Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu IT Academy từ MySQL...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {itCourses.map(course => (
              <div
                key={course.id}
                onClick={() => setSelectedModule(course)}
                style={{
                  background: '#fff',
                  border: selectedModule?.id === course.id ? `2px solid ${course.color || '#2563eb'}` : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '18px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', textTransform: 'uppercase' }}>
                    {course.category}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{course.level}</span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 6px', color: '#0f172a' }}>{course.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{course.description}</p>
              </div>
            ))}
          </div>

          {/* Active Module Topics & Code */}
          {selectedModule && Array.isArray(selectedModule.topics) && selectedModule.topics.length > 0 && (
            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '36px'
            }}>
              <h2 style={{ fontSize: '21px', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
                Chi tiết bài giảng: {selectedModule.title}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {selectedModule.topics.map((t, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{t.title}</h3>
                      {t.enTerm && (
                        <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px' }}>
                          {t.enTerm}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>{t.viDesc}</p>
                    {t.enExplanation && (
                      <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#0369a1', fontStyle: 'italic' }}>
                        <strong>IT English Context:</strong> {t.enExplanation}
                      </p>
                    )}
                    {t.codeSnippet && (
                      <pre style={{
                        background: '#0f172a',
                        color: '#e2e8f0',
                        padding: '14px',
                        borderRadius: '10px',
                        overflowX: 'auto',
                        fontSize: '13px',
                        margin: 0
                      }}>
                        <code>{t.codeSnippet}</code>
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IT Terms Explorer */}
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            Kho Thuật Ngữ Tiếng Anh Chuyên Ngành ({itTerms.length} thuật ngữ)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px' }}>
            {itTerms.map((term, idx) => (
              <div key={idx} style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #0284c7',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '17px', color: '#0284c7' }}>{term.word}</strong>
                  <button
                    onClick={() => speakTerm(term.word)}
                    style={{ background: '#f0f9ff', color: '#0284c7', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' }}
                  >
                    <i className="fas fa-volume-high"></i>
                  </button>
                </div>
                {term.phonetic && <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{term.phonetic}</div>}
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{term.meaning}</div>
                {term.example && (
                  <div style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                    {term.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
