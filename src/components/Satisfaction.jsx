function Satisfaction({ level }) {
  const color = level > 70 ? '#27ae60' : level > 40 ? '#f39c12' : '#e74c3c';
  const emoji = level > 70 ? '😄' : level > 40 ? '😐' : '😟';
  return (
    <div style={{ background: '#ecf0f1', padding: '15px', borderRadius: '5px', textAlign: 'center', flex: 1, minWidth: '200px' }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Задоволеність {emoji}</h3>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color, margin: '5px 0' }}>{level}%</p>
      <div style={{ background: '#ddd', borderRadius: '10px', height: '10px' }}>
        <div style={{ background: color, width: `${level}%`, height: '100%', borderRadius: '10px' }} />
      </div>
    </div>
  );
}

export default Satisfaction;