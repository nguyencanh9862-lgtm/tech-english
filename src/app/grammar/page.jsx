'use client';

import React, { useEffect, useState } from 'react';

export default function NextGrammarPage() {
  const [grammarList, setGrammarList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/grammar')
      .then(r => r.json())
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          setGrammarList(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 6px', color: '#0f172a' }}>
          <i className="fas fa-pen-nib" style={{ color: '#6366f1', marginRight: '10px' }}></i>
          Bài Học Ngữ Pháp Cốt Lõi (MySQL `grammars`)
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Hệ thống công thức, cách dùng, dấu hiệu nhận biết và ví dụ song ngữ từ cơ sở dữ liệu MySQL ({grammarList.length} chủ điểm).
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải bài học ngữ pháp từ MySQL...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {grammarList.map((item, idx) => (
            <div key={item.id || idx} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  <i className={item.icon || 'fas fa-circle-dot'} style={{ color: item.color || '#6366f1', marginRight: '8px' }}></i>
                  {item.title}
                </h2>
                {item.formula && (
                  <code style={{ background: '#eef2ff', color: '#4f46e5', padding: '5px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '14px' }}>
                    {item.formula}
                  </code>
                )}
              </div>

              <p style={{ color: '#475569', fontSize: '15px', margin: '0 0 14px', lineHeight: 1.6 }}>
                {item.description}
              </p>

              {Array.isArray(item.uses) && item.uses.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>Cách dùng:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: 1.6 }}>
                    {item.uses.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                </div>
              )}

              {Array.isArray(item.examples) && item.examples.length > 0 && (
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px 16px', borderLeft: `4px solid ${item.color || '#6366f1'}` }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Ví dụ minh họa:
                  </div>
                  {item.examples.map((ex, i) => (
                    <div key={i} style={{ marginBottom: '6px', fontSize: '14px' }}>
                      <strong style={{ color: '#0f172a' }}>{ex.en}</strong>
                      <span style={{ color: '#64748b' }}> &mdash; {ex.vi}</span>
                    </div>
                  ))}
                </div>
              )}

              {Array.isArray(item.signals) && item.signals.length > 0 && (
                <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
                  <strong>Dấu hiệu nhận biết:</strong> {item.signals.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
