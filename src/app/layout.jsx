import React from 'react';
import NextNavbar from '../components/NextNavbar';

export const metadata = {
  title: 'Mê Linh TechEnglish – Next.js + Express + MySQL',
  description: 'Hệ thống học Tiếng Anh & CNTT Fullstack sử dụng Next.js App Router, Express RESTful API và cơ sở dữ liệu MySQL.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
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
            <div>
              <strong style={{ color: '#fff' }}>Mê Linh TechEnglish PRO</strong> &bull; Nâng cấp toàn diện với <strong>Next.js + Express + MySQL</strong>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="/index.html" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Giao diện Full Studio</a>
              <a href="/mvc" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Giao diện MVC</a>
              <a href="/admin/index.html" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Admin Panel</a>
              <a href="/api/health" style={{ color: '#38bdf8', textDecoration: 'none' }}>MySQL Health API</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
