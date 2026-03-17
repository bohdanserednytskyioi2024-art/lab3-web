import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './components/Auth';
import CityPage from './pages/CityPage';
import BudgetPage from './pages/BudgetPage';
import SatisfactionPage from './pages/SatisfactionPage';

export default function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.5rem' }}>
      ⏳ Завантаження...
    </div>
  );

  return (
    <BrowserRouter>
      {!user && <Auth user={user} />}
      <header style={{ background: '#2c3e50', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🏙️ CitySimulator 2026</div>
        <nav style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/"             style={navLink}>🏙️ Моє місто</Link>
          <Link to="/budget"       style={navLink}>💰 Бюджет</Link>
          <Link to="/satisfaction" style={navLink}>😊 Задоволеність</Link>
          {user && <Auth user={user} />}
        </nav>
      </header>
      <Routes>
        <Route path="/"             element={<CityPage      user={user} />} />
        <Route path="/budget"       element={<BudgetPage    user={user} />} />
        <Route path="/satisfaction" element={<SatisfactionPage user={user} />} />
      </Routes>
      <footer style={{ background: '#2c3e50', color: '#ecf0f1', textAlign: 'center', padding: '20px', marginTop: '20px' }}>
        <h3 style={{ color: '#e67e22' }}>Контакти мерії</h3>
        <p>Адреса: вул. Сахарова, 19 | Email: mayor@citysim.ua | Тел: +380 44 123 45 67</p>
        <p>&copy; 2026 Симулятор Міста. Всі права захищено.</p>
      </footer>
    </BrowserRouter>
  );
}

const navLink = { color: 'white', textDecoration: 'none', padding: '5px 12px' };