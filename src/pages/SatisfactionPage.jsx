import Satisfaction from '../components/Satisfaction';

export default function SatisfactionPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <section style={{ background: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #e67e22', paddingBottom: '10px' }}>😊 Задоволеність жителів</h2>
        <Satisfaction level={75} />
        <div style={{ marginTop: '20px' }}>
          <p>✅ Подобається: чисті вулиці, нові парки</p>
          <p>⚠️ Скарги: шум від заводу, нестача лікарень</p>
          <p>💡 Порада: побудуй парк щоб підвищити рівень</p>
        </div>
      </section>
    </div>
  );
}