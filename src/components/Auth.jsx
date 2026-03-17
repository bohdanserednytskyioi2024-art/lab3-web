import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase';

export default function Auth({ user }) {
  const [isLogin, setIsLogin] = useState(true); // true=вхід, false=реєстрація
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      // Переводимо помилки Firebase на українську
      const msgs = {
        'auth/user-not-found':   'Користувача не знайдено',
        'auth/wrong-password':   'Невірний пароль',
        'auth/email-already-in-use': 'Email вже використовується',
        'auth/weak-password':    'Пароль мінімум 6 символів',
        'auth/invalid-email':    'Невірний формат email',
        'auth/invalid-credential': 'Невірний email або пароль',
      };
      setError(msgs[err.code] || err.message);
    }
    setLoading(false);
  }

  async function handleLogout() {
    await signOut(auth);
  }

  // Якщо користувач вже залогінений — показуємо статус
  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ color: 'white', fontSize: '0.9rem' }}>
          ✅ {user.email}
        </span>
        <button onClick={handleLogout} style={{
          padding: '6px 14px', background: '#e74c3c', color: 'white',
          border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
        }}>
          Вийти
        </button>
      </div>
    );
  }

  // Форма входу/реєстрації
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: 'white', padding: '35px', borderRadius: '12px',
        width: '360px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', textAlign: 'center' }}>
          🏙️ CitySimulator 2026
        </h2>
        <h3 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#555' }}>
          {isLogin ? 'Вхід в систему' : 'Реєстрація'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Мінімум 6 символів"
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <p style={{ color: '#e74c3c', background: '#fde8e8', padding: '10px', borderRadius: '5px', margin: '0 0 15px 0', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: '#2c3e50',
            color: 'white', border: 'none', borderRadius: '5px',
            fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
          }}>
            {loading ? '⏳ Зачекайте...' : (isLogin ? 'Увійти' : 'Зареєструватись')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '15px', color: '#666' }}>
          {isLogin ? 'Немає акаунту?' : 'Вже є акаунт?'}{' '}
          <span
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ color: '#3498db', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLogin ? 'Зареєструватись' : 'Увійти'}
          </span>
        </p>
      </div>
    </div>
  );
}