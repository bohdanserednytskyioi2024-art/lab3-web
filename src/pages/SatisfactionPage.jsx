import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Satisfaction from '../components/Satisfaction';

export default function SatisfactionPage({ user }) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const snap = await getDocs(collection(db, 'users', user.uid, 'buildings'));
      setBuildings(snap.docs.map(d => d.data()));
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <div style={{ padding: '20px' }}>⏳ Завантаження...</div>;

  // Рахуємо задоволеність на основі будівель
  const residential  = buildings.filter(b => b.type === 'житлові').length;
  const commercial   = buildings.filter(b => b.type === 'комерційні').length;
  const industrial   = buildings.filter(b => b.type === 'промислові').length;
  const totalLevels  = buildings.reduce((sum, b) => sum + (b.level || 1), 0);

  // Формула: житлові +10%, комерційні +5%, промислові -3%, рівні +2%
  let level = 30; // базовий рівень
  level += residential * 10;
  level += commercial  * 5;
  level -= industrial  * 3;
  level += totalLevels * 2;
  level = Math.min(100, Math.max(0, level)); // 0-100

  const tips = [];
  if (residential < 2) tips.push('🏠 Побудуй більше житлових об\'єктів (+10% за кожен)');
  if (commercial  < 2) tips.push('🏬 Додай комерційні об\'єкти (+5% за кожен)');
  if (industrial  > 3) tips.push('🏭 Забагато промислових об\'єктів (-3% за кожен)');
  if (totalLevels < 5) tips.push('⭐ Покращуй будівлі для збільшення задоволеності (+2% за рівень)');

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <section style={{ background: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #e67e22', paddingBottom: '10px' }}>😊 Задоволеність жителів</h2>
        <Satisfaction level={level} />
        <div style={{ marginTop: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ background: '#ecf0f1', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
            <h3 style={{ marginTop: 0 }}>📊 Статистика міста</h3>
            <p>🏠 Житлових будівель: <b>{residential}</b> (+{residential*10}%)</p>
            <p>🏬 Комерційних будівель: <b>{commercial}</b> (+{commercial*5}%)</p>
            <p>🏭 Промислових будівель: <b>{industrial}</b> (-{industrial*3}%)</p>
            <p>⭐ Загальний рівень будівель: <b>{totalLevels}</b> (+{totalLevels*2}%)</p>
          </div>
          {tips.length > 0 && (
            <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
              <h3 style={{ marginTop: 0 }}>💡 Поради</h3>
              {tips.map((t, i) => <p key={i}>{t}</p>)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}