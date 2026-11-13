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
    { href: '/nextjs', label: 'Trang chủ Y8', icon: 'fas fa-house' },
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
        background: 'linear-gradient(90deg, #0f172a 0%, #312e81 50%, #1e293b 100%)',
        color: '#fff',
        padding: '7px 18px',
        fontSize: '12.5px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            padding: '2px 10px',
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '11px',
            letterSpacing: '0.4px'
          }}>
            Y8 NEXT.JS + EXPRESS + MYSQL
          </span>
          <span>
            <i className="fas fa-database" style={{ color: '#38bdf8', marginRight: '6px' }}></i>
            Database: <strong>{health.dbType || 'MySQL'}</strong> ({health.database === 'connected' ? '🟢 Online' : '🔴 Offline'})
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/index.html" style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 700 }}>
            <i className="fas fa-gamepad"></i> Y8 Full Studio
          </a>
          <a href="/mvc" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 700 }}>
            <i className="fas fa-cubes"></i> Y8 MVC
          </a>
          <a href="/admin/index.html" style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            padding: '3px 11px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 700
          }}>
            <i className="fas fa-shield-halved"></i> Y8 Admin
          </a>
        </div>
      </div>

      <header style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <Link href="/nextjs" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="/favicon.svg"
              alt="Y8 Logo"
              width="36"
              height="36"
              style={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Y<span style={{ color: '#6366f1' }}>8</span>
              </span>
              <span style={{
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#6366f1',
                fontSize: '10px',
                padding: '2px 7px',
                borderRadius: '999px',
                fontWeight: 800
              }}>
                PRO
              </span>
            </div>
          </Link>

          <nav style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '999px',
            border: '1px solid #e2e8f0'
          }}>
            {navItems.map(item => {
              const active = pathname === item.href || (item.href === '/nextjs' && pathname === '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    textDecoration: 'none',
                    padding: '7px 14px',
                    borderRadius: '999px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                    color: active ? '#fff' : '#334155',
                    boxShadow: active ? '0 4px 12px rgba(99, 102, 241, 0.28)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <i className={item.icon} style={{ color: active ? '#fff' : '#64748b' }}></i>
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
