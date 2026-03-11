import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CityPage from './pages/CityPage';
import BudgetPage from './pages/BudgetPage';
import SatisfactionPage from './pages/SatisfactionPage';

function App() {
  return (
    <BrowserRouter>
      <header style={{ background: '#2c3e50', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>CitySimulator 2026</div>
        <nav>
          <Link to="/"             style={navLink}>🏙️ Моє місто</Link>
          <Link to="/budget"       style={navLink}>💰 Бюджет і Ресурси</Link>
          <Link to="/satisfaction" style={navLink}>😊 Задоволеність</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/"             element={<CityPage />} />
        <Route path="/budget"       element={<BudgetPage />} />
        <Route path="/satisfaction" element={<SatisfactionPage />} />
      </Routes>

      <footer style={{ background: '#2c3e50', color: '#ecf0f1', textAlign: 'center', padding: '20px', marginTop: '20px' }}>
        <h3 style={{ color: '#e67e22' }}>Контакти мерії</h3>
        <p>Адреса: вул. Сахарова, 19</p>
        <p>Email: mayor@citysim.ua</p>
        <p>Тел: +380 44 123 45 67</p>
        <p>&copy; 2026 Симулятор Міста. Всі права захищено.</p>
      </footer>
    </BrowserRouter>
  );
}

const navLink = { color: 'white', textDecoration: 'none', padding: '5px 12px', marginLeft: '10px' };

export default App;