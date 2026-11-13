'use client';

import React, { useEffect, useState } from 'react';

export default function NextNewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [activeArticle, setActiveArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          setNewsList(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 6px', color: '#0f172a' }}>
          <i className="fas fa-newspaper" style={{ color: '#f59e0b', marginRight: '10px' }}></i>
          Cổng Tin Tức Công Nghệ Song Ngữ (MySQL `news`)
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Đọc các bài phân tích chuyên sâu về AI, Cloud, Cybersecurity và học từ vựng tiếng Anh ngay trong bài viết.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải tin tức công nghệ từ MySQL...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
          {newsList.map(article => (
            <div key={article.id} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {article.image && (
                <img src={article.image} alt={article.title} style={{ width: '100%', height: '185px', objectFit: 'cover' }} />
              )}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>
                    {article.categoryLabel || article.category}
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    <i className="far fa-clock"></i> {article.readTime || '5 phút đọc'}
                  </span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 10px', color: '#0f172a', lineHeight: 1.4 }}>
                  {article.title}
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px', flex: 1 }}>
                  {article.summary}
                </p>

                {Array.isArray(article.keyVocab) && article.keyVocab.length > 0 && (
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Key IT Vocabulary:
                    </div>
                    <div style={{ fontSize: '12px', color: '#334155' }}>
                      {article.keyVocab.slice(0, 3).map((v, i) => (
                        <span key={i}>
                          <strong>{v.word}</strong> ({v.meaning}){i < Math.min(article.keyVocab.length, 3) - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setActiveArticle(article)}
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Đọc toàn bộ bài viết &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Reader Modal */}
      {activeArticle && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '18px',
            padding: '28px',
            maxWidth: '760px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '999px' }}>
                {activeArticle.categoryLabel || activeArticle.category}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}
              >
                &times;
              </button>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 12px', color: '#0f172a' }}>{activeArticle.title}</h2>
            <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: '20px' }}>
              {activeArticle.content}
            </p>
            {Array.isArray(activeArticle.keyVocab) && activeArticle.keyVocab.length > 0 && (
              <div style={{ background: '#f0f9ff', borderRadius: '12px', padding: '16px', border: '1px solid #bae6fd' }}>
                <h4 style={{ margin: '0 0 10px', color: '#0369a1' }}>Từ vựng chuyên ngành trong bài viết:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                  {activeArticle.keyVocab.map((v, idx) => (
                    <div key={idx} style={{ background: '#fff', padding: '10px', borderRadius: '8px' }}>
                      <strong style={{ color: '#0284c7' }}>{v.word}</strong> {v.phonetic && <small>{v.phonetic}</small>}
                      <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{v.meaning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
