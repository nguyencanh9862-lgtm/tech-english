import React from 'react';
import NextNavbar from '../components/NextNavbar';

export const metadata = {
  title: 'Y8 – Nền Tảng Học Tiếng Anh, Lập Trình & Đấu Trường AI (Next.js + Express + MySQL)',
  description: 'Y8 – Hệ thống học Tiếng Anh & CNTT Fullstack sử dụng Next.js App Router, Express RESTful API và cơ sở dữ liệu MySQL.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        margin: 0,
        fontFamily: "'Inter', 'Nunito', sans-serif",
        background: '#f8fafc',
        color: '#0f172a',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <NextNavbar />
        <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '28px 20px', boxSizing: 'border-box' }}>
          {children}
        </main>
        <footer style={{
          background: '#0f172a',
          color: '#94a3b8',
          padding: '28px 20px',
          textAlign: 'center',
          fontSize: '14px',
          marginTop: '48px'
        }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/favicon.svg" alt="Y8" width="26" height="26" style={{ borderRadius: '6px' }} />
              <span>
                <strong style={{ color: '#fff' }}>Y8 PRO</strong> &bull; Nền tảng Học Tiếng Anh, CNTT &amp; Đấu Trường AI (<strong>Next.js + Express + MySQL</strong>)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="/index.html" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Y8 Full Studio</a>
              <a href="/mvc" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Y8 MVC</a>
              <a href="/admin/index.html" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Y8 Admin</a>
              <a href="/api/health" style={{ color: '#fda4af', textDecoration: 'none' }}>MySQL Health API</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
