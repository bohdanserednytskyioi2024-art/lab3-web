function Budget({ amount }) {
  return (
    <div style={{ background: '#ecf0f1', padding: '15px', borderRadius: '5px', textAlign: 'center', flex: 1, minWidth: '200px' }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Бюджет</h3>
      <p>
        <span style={{ fontWeight: 'bold', color: '#27ae60', fontSize: '1.5rem' }}>
          {amount.toLocaleString()}
        </span> ₴
      </p>
    </div>
  );
}

export default Budget;