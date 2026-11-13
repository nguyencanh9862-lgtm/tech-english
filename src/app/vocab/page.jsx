'use client';

import React, { useEffect, useState } from 'react';

export default function NextVocabPage() {
  const [vocabList, setVocabList] = useState([]);
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState({
    word: '',
    phonetic: '',
    pos: 'n',
    meaning: '',
    example: '',
    exampleVi: '',
    category: 'daily',
    level: 'B1'
  });

  const fetchVocab = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (level !== 'all') params.set('level', level);
    if (search.trim()) params.set('search', search.trim());

    fetch(`/api/vocab?${params.toString()}`)
      .then(r => r.json())
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          setVocabList(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchVocab();
  }, [category, level]);

  const speakWord = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  const handleCreateVocab = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vocab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWord)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewWord({ word: '', phonetic: '', pos: 'n', meaning: '', example: '', exampleVi: '', category: 'daily', level: 'B1' });
        fetchVocab();
      }
    } catch (err) {}
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 6px', color: '#0f172a' }}>
            <i className="fas fa-book-open" style={{ color: '#2563eb', marginRight: '10px' }}></i>
            Kho Từ Vựng Tiếng Anh (MySQL `vocabularies`)
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Tra cứu, lọc theo chủ đề/trình độ CEFR và nghe phát âm trực tiếp từ cơ sở dữ liệu MySQL ({vocabList.length} từ vựng).
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '11px 18px',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className="fas fa-plus"></i> Thêm từ vựng vào MySQL
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', flex: 1, minWidth: '240px', gap: '8px' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchVocab()}
            placeholder="Tìm từ vựng, nghĩa hoặc câu ví dụ..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px'
            }}
          />
          <button
            onClick={fetchVocab}
            style={{
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <i className="fas fa-search"></i> Tìm
          </button>
        </div>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600 }}
        >
          <option value="all">Tất cả chủ đề</option>
          <option value="daily">Giao tiếp hàng ngày (Daily)</option>
          <option value="business">Kinh doanh (Business)</option>
          <option value="travel">Du lịch (Travel)</option>
          <option value="academic">Học thuật (Academic)</option>
          <option value="idiom">Thành ngữ (Idioms)</option>
          <option value="it">Công nghệ thông tin (IT)</option>
        </select>

        <select
          value={level}
          onChange={e => setLevel(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600 }}
        >
          <option value="all">Tất cả cấp độ</option>
          <option value="A1">Cấp độ A1</option>
          <option value="A2">Cấp độ A2</option>
          <option value="B1">Cấp độ B1</option>
          <option value="B2">Cấp độ B2</option>
          <option value="C1">Cấp độ C1</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang truy vấn bảng `vocabularies` từ MySQL...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
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
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{item.word}</h2>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={() => speakWord(item.word)}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer'
                      }}
                      title="Phát âm từ vựng"
                    >
                      <i className="fas fa-volume-high"></i>
                    </button>
                    <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '12px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px' }}>
                      {item.level}
                    </span>
                  </div>
                </div>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px' }}>
                  {item.phonetic} &bull; <strong style={{ color: '#2563eb' }}>{item.pos}</strong>
                </p>
                <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px', margin: '0 0 12px' }}>
                  {item.meaning}
                </p>
              </div>
              <div>
                {item.example && (
                  <div style={{
                    background: '#f8fafc',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#475569',
                    borderLeft: '3px solid #3b82f6',
                    marginBottom: '8px'
                  }}>
                    <div><strong>Ví dụ:</strong> {item.example}</div>
                    {item.exampleVi && <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>{item.exampleVi}</div>}
                  </div>
                )}
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Chủ đề: {item.category} &bull; ID #{item.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Vocab */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '16px'
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '26px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 800 }}>Thêm Từ Vựng Mới vào MySQL</h3>
            <form onSubmit={handleCreateVocab} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                required
                placeholder="Từ tiếng Anh (VD: Microservices)"
                value={newWord.word}
                onChange={e => setNewWord({ ...newWord, word: e.target.value })}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  placeholder="Phiên âm IPA (VD: /ˌmaɪ.krəʊˈsɜː.vɪ.sɪz/)"
                  value={newWord.phonetic}
                  onChange={e => setNewWord({ ...newWord, phonetic: e.target.value })}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <select
                  value={newWord.pos}
                  onChange={e => setNewWord({ ...newWord, pos: e.target.value })}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="n">Danh từ (n)</option>
                  <option value="v">Động từ (v)</option>
                  <option value="adj">Tính từ (adj)</option>
                  <option value="idiom">Idiom</option>
                </select>
              </div>
              <input
                required
                placeholder="Nghĩa tiếng Việt"
                value={newWord.meaning}
                onChange={e => setNewWord({ ...newWord, meaning: e.target.value })}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <input
                placeholder="Câu ví dụ tiếng Anh"
                value={newWord.example}
                onChange={e => setNewWord({ ...newWord, example: e.target.value })}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Lưu vào MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
