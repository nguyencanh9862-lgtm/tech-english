'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NextNavbar() {
  const pathname = usePathname();
  const [health, setHealth] = useState({ database: 'connected', dbType: 'MySQL', engine: 'MySQL 8.0' });

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        if (data && data.status === 'online') {
          setHealth(data);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { href: '/nextjs', label: 'Tổng quan Next.js', icon: 'fas fa-layer-group' },
    { href: '/vocab', label: 'Từ vựng', icon: 'fas fa-book-open' },
    { href: '/courses', label: 'Khóa học Video', icon: 'fab fa-youtube' },
    { href: '/grammar', label: 'Ngữ pháp', icon: 'fas fa-pen-nib' },
    { href: '/quiz', label: 'Trắc nghiệm Quiz', icon: 'fas fa-circle-question' },
    { href: '/it', label: 'IT Academy', icon: 'fas fa-laptop-code' },
    { href: '/news', label: 'Tin tức CNTT', icon: 'fas fa-newspaper' }
  ];

  return (
    <>
      <div style={{
        background: 'linear-gradient(90deg, #0f172a 0%, #1e3a8a 50%, #0f766e 100%)',
        color: '#fff',
        padding: '8px 16px',
        fontSize: '13px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{
            background: '#2563eb',
            padding: '2px 10px',
            borderRadius: '999px',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.4px'
          }}>
            NEXT.JS APP ROUTER + EXPRESS + MYSQL
          </span>
          <span>
            <i className="fas fa-database" style={{ color: '#38bdf8', marginRight: '6px' }}></i>
            Database: <strong>{health.dbType || 'MySQL'}</strong> ({health.database === 'connected' ? '🟢 Online' : '🔴 Offline'})
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/index.html" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>
            <i className="fas fa-bolt"></i> Giao diện Full Studio
          </a>
          <a href="/mvc" style={{ color: '#6ee7b7', textDecoration: 'none', fontWeight: 600 }}>
            <i className="fas fa-cubes"></i> MVC Views
          </a>
          <a href="/admin/index.html" style={{
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            padding: '3px 10px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600
          }}>
            <i className="fas fa-shield-halved"></i> Admin Panel
          </a>
        </div>
      </div>

      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <Link href="/nextjs" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              <i className="fas fa-laptop-code"></i>
            </div>
            <div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                Mê <span style={{ color: '#2563eb' }}>Linh</span>
              </span>
              <span style={{
                marginLeft: '6px',
                background: '#dbeafe',
                color: '#1d4ed8',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: 700
              }}>
                Next.js + MySQL
              </span>
            </div>
          </Link>

          <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {navItems.map(item => {
              const active = pathname === item.href || (item.href === '/nextjs' && pathname === '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    textDecoration: 'none',
                    padding: '8px 13px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: active ? '#eff6ff' : 'transparent',
                    color: active ? '#2563eb' : '#334155',
                    border: active ? '1px solid #bfdbfe' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <i className={item.icon} style={{ color: active ? '#2563eb' : '#64748b' }}></i>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
