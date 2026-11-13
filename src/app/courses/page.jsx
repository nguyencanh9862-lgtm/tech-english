'use client';

import React, { useEffect, useState } from 'react';

export default function NextCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          setCourses(res.data);
          if (res.data.length > 0) setSelectedCourse(res.data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentLesson = selectedCourse?.lessons?.[activeLessonIdx] || null;
  const ytId = currentLesson?.youtubeId || selectedCourse?.youtubeId || '';

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 6px', color: '#0f172a' }}>
          <i className="fab fa-youtube" style={{ color: '#ef4444', marginRight: '10px' }}></i>
          Khóa Học Video Tương Tác (MySQL `courses`)
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Chọn khóa học để xem video bài giảng trực tuyến và ôn tập từ vựng theo từng bài học.
        </p>
      </div>

      {/* Video Player Theater */}
      {selectedCourse && (
        <div style={{
          background: '#0f172a',
          color: '#fff',
          borderRadius: '18px',
          padding: '24px',
          marginBottom: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          <div>
            {ytId ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                  title={selectedCourse.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', background: '#1e293b', borderRadius: '12px' }}>
                Chưa có video nhúng
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>
                ĐANG HỌC: {selectedCourse.level}
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '10px 0 8px' }}>{selectedCourse.title}</h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px' }}>
                {selectedCourse.description}
              </p>

              {/* Lesson Playlist */}
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                Danh sách bài giảng ({selectedCourse.lessons?.length || 0} bài):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {(selectedCourse.lessons || []).map((les, idx) => (
                  <button
                    key={les.id || idx}
                    onClick={() => setActiveLessonIdx(idx)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: idx === activeLessonIdx ? '1px solid #3b82f6' : '1px solid #334155',
                      background: idx === activeLessonIdx ? 'rgba(59, 130, 246, 0.2)' : '#1e293b',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>
                      <i className="fas fa-play-circle" style={{ marginRight: '8px', color: idx === activeLessonIdx ? '#60a5fa' : '#94a3b8' }}></i>
                      {les.title}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{les.duration || '10:00'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Cards */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách khóa học từ MySQL...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '22px' }}>
          {courses.map(c => (
            <div
              key={c.id}
              onClick={() => { setSelectedCourse(c); setActiveLessonIdx(0); }}
              style={{
                background: '#fff',
                border: selectedCourse?.id === c.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
              }}
            >
              {c.thumbnail && (
                <img src={c.thumbnail} alt={c.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              )}
              <div style={{ padding: '18px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '11px', padding: '3px 9px', borderRadius: '999px', fontWeight: 700 }}>
                    {c.category}
                  </span>
                  <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '11px', padding: '3px 9px', borderRadius: '999px', fontWeight: 700 }}>
                    {c.level}
                  </span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>{c.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>{c.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <span><i className="fas fa-chalkboard-user"></i> {c.instructor}</span>
                  <span><i className="fas fa-video"></i> {c.lessons?.length || 1} bài học</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
