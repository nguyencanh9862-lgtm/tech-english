'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NextDashboardPage() {
  const [stats, setStats] = useState({
    vocabCount: 22,
    courseCount: 5,
    grammarCount: 6,
    quizCount: 30,
    userCount: 1
  });
  const [vocabList, setVocabList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()).catch(() => null),
      fetch('/api/vocab').then(r => r.json()).catch(() => null),
      fetch('/api/courses').then(r => r.json()).catch(() => null),
      fetch('/api/news').then(r => r.json()).catch(() => null)
    ]).then(([resStats, resVocab, resCourses, resNews]) => {
      if (resStats?.success && resStats.data) setStats(resStats.data);
      if (resVocab?.success && resVocab.data) setVocabList(resVocab.data.slice(0, 8));
      if (resCourses?.success && resCourses.data) setCourses(resCourses.data.slice(0, 4));
      if (resNews?.success && resNews.data) setNewsList(resNews.data.slice(0, 3));
      setLoading(false);
    });
  }, []);

  const speakWord = (word) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0d9488 100%)',
        borderRadius: '20px',
        padding: '42px 32px',
        color: '#fff',
        marginBottom: '32px',
        boxShadow: '0 12px 30px rgba(37, 99, 235, 0.18)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ maxWidth: '680px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.16)',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '14px'
            }}>
              <i className="fas fa-bolt" style={{ color: '#fde047' }}></i>
              <span>Nền tảng Next.js App Router + Express API + Cơ sở dữ liệu MySQL</span>
            </div>
            <h1 style={{ fontSize: '34px', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.25 }}>
              Y8 – Hệ Sinh Thái Học Tiếng Anh, Lập Trình &amp; Đấu Trường AI
            </h1>
            <p style={{ fontSize: '16px', opacity: 0.92, lineHeight: 1.6, margin: '0 0 24px' }}>
              Toàn bộ dữ liệu từ vựng, khóa học video, ngữ pháp, ngân hàng câu hỏi Quiz, lộ trình CNTT và tin tức công nghệ được quản lý tập trung trên <strong>MySQL</strong> thông qua <strong>Express RESTful API</strong> và hiển thị tốc độ cao với <strong>Next.js</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/vocab" style={{
                background: '#fff',
                color: '#1e3a8a',
                textDecoration: 'none',
                padding: '12px 22px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-book-open"></i> Học Từ Vựng Ngay
              </Link>
              <Link href="/courses" style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                textDecoration: 'none',
                padding: '12px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fab fa-youtube"></i> Xem Khóa Học Video
              </Link>
              <a href="/index.html" style={{
                background: 'rgba(15, 23, 42, 0.35)',
                color: '#fff',
                textDecoration: 'none',
                padding: '12px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-gamepad"></i> Mở Đấu Trường AI & Code Live
              </a>
            </div>
          </div>

          {/* Real-time MySQL Stats Box */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            padding: '22px',
            minWidth: '280px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#93c5fd', marginBottom: '12px', textTransform: 'uppercase' }}>
              <i className="fas fa-database"></i> Thống kê Bảng MySQL Thời gian thực
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: 900 }}>{stats.vocabCount}</div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>Bảng `vocabularies`</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: 900 }}>{stats.courseCount}</div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>Bảng `courses`</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: 900 }}>{stats.quizCount}</div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>Bảng `quizzes`</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: 900 }}>{stats.grammarCount}</div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>Bảng `grammars`</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Vocabulary from MySQL */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
              <i className="fas fa-book-bookmark" style={{ color: '#2563eb', marginRight: '8px' }}></i>
              Từ Vựng Nổi Bật (MySQL `vocabularies`)
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              Click vào biểu tượng loa để nghe phát âm chuẩn IPA từ cơ sở dữ liệu MySQL
            </p>
          </div>
          <Link href="/vocab" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
            Xem tất cả ({stats.vocabCount}) &rarr;
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu từ MySQL...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '18px' }}>
            {vocabList.map(item => (
              <div key={item.id} style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>{item.word}</h3>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        onClick={() => speakWord(item.word)}
                        title="Nghe phát âm"
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: 'none',
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          cursor: 'pointer'
                        }}
                      >
                        <i className="fas fa-volume-high"></i>
                      </button>
                      <span style={{
                        background: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '999px'
                      }}>
                        {item.level}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                    {item.phonetic} &bull; <strong style={{ color: '#2563eb' }}>{item.pos}</strong>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
                    {item.meaning}
                  </div>
                </div>
                {item.example && (
                  <div style={{
                    background: '#f8fafc',
                    borderLeft: '3px solid #3b82f6',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#475569'
                  }}>
                    <div><strong>Ex:</strong> {item.example}</div>
                    {item.exampleVi && <div style={{ color: '#94a3b8', marginTop: '3px' }}>{item.exampleVi}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Video Courses from MySQL */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
              <i className="fab fa-youtube" style={{ color: '#ef4444', marginRight: '8px' }}></i>
              Khóa Học Video (MySQL `courses`)
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              Học qua video bài giảng thực tế kèm danh sách từ vựng từng bài học
            </p>
          </div>
          <Link href="/courses" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
            Xem tất cả khóa học &rarr;
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
          {courses.map(course => (
            <div key={course.id} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  style={{ width: '100%', height: '165px', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                    {course.category}
                  </span>
                  <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                    {course.level}
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 8px', color: '#0f172a', lineHeight: 1.4 }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px', lineHeight: 1.5, flex: 1 }}>
                  {course.description}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '12px',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  <span><i className="fas fa-chalkboard-user"></i> {course.instructor}</span>
                  <Link href="/courses" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                    Học ngay ({course.lessons?.length || 1} bài) &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Tech News from MySQL */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
              <i className="fas fa-newspaper" style={{ color: '#f59e0b', marginRight: '8px' }}></i>
              Tin Tức Công Nghệ Song Ngữ (MySQL `news`)
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              Đọc tin công nghệ mới nhất và tích lũy thuật ngữ tiếng Anh chuyên ngành
            </p>
          </div>
          <Link href="/news" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
            Xem tất cả bài báo &rarr;
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {newsList.map(item => (
            <div key={item.id} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
            }}>
              {item.image && (
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '175px', objectFit: 'cover' }} />
              )}
              <div style={{ padding: '18px' }}>
                <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px' }}>
                  {item.categoryLabel || item.category}
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '10px 0 8px', color: '#0f172a' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px' }}>
                  {item.summary}
                </p>
                <Link href="/news" style={{ color: '#2563eb', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                  Đọc chi tiết & từ vựng &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
