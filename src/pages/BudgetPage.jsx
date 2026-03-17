import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Budget from '../components/Budget';

export default function BudgetPage({ user }) {
  const [resources, setResources] = useState(null);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const snap = await getDoc(doc(db, 'users', user.uid, 'state', 'resources'));
      if (snap.exists()) setResources(snap.data());
    }
    load();
  }, [user]);

  if (!resources) return <div style={{ padding: '20px' }}>⏳ Завантаження...</div>;

  const витрати = (1000000 - resources.budget);
  const доходи  = resources.budget > 0 ? Math.round(resources.budget * 0.05) : 0;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <section style={{ background: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #e67e22', paddingBottom: '10px' }}>💰 Бюджет міста</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '15px' }}>
          <Budget amount={resources.budget} />
          <div style={{ background: '#ecf0f1', padding: '15px', borderRadius: '5px', flex: 1, minWidth: '200px' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Фінансовий звіт</h3>
            <p style={{ color: 'green' }}>📈 Доходи від будівель: +{доходи.toLocaleString()} ₴</p>
            <p style={{ color: 'red'   }}>📉 Витрачено на будівництво: -{витрати.toLocaleString()} ₴</p>
            <p style={{ fontWeight: 'bold' }}>🧱 Бетон: {resources.concrete}т | ⚙️ Метал: {resources.metal}т</p>
            <p style={{ fontWeight: 'bold' }}>🌳 Дерево: {resources.wood}т | 🛣️ Асфальт: {resources.asphalt}т</p>
            <p style={{ fontWeight: 'bold' }}>👷 Будівельники: {resources.builders} осіб</p>
          </div>
        </div>
      </section>
    </div>
  );
}