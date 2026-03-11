function BuildingCard({ name, type, cost, description }) {
  return (
    <div style={{
      border: '2px solid #bdc3c7', borderRadius: '8px', padding: '12px',
      width: '200px', background: 'white', textAlign: 'center', cursor: 'pointer',
      boxShadow: '2px 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{name}</h3>
      <p style={{ margin: '4px 0', color: '#666', fontSize: '0.85rem' }}>📂 {type}</p>
      <p style={{ margin: '4px 0', color: '#27ae60', fontWeight: 'bold' }}>💵 {cost.toLocaleString()} ₴</p>
      <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#555' }}>{description}</p>
    </div>
  );
}

export default BuildingCard;