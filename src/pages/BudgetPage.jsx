import Budget from '../components/Budget';
import Satisfaction from '../components/Satisfaction';

export default function BudgetPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <section style={{ background: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #e67e22', paddingBottom: '10px' }}>💰 Бюджет міста</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '15px' }}>
          <Budget amount={1000000} />
          <div style={{ background: '#ecf0f1', padding: '15px', borderRadius: '5px', flex: 1, minWidth: '200px' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Цей місяць</h3>
            <p style={{ color: 'green' }}>📈 Доходи: +150 000 ₴</p>
            <p style={{ color: 'red' }}>📉 Витрати: -85 000 ₴</p>
            <p style={{ fontWeight: 'bold' }}>📊 Баланс: +65 000 ₴</p>
          </div>
        </div>
      </section>
    </div>
  );
}