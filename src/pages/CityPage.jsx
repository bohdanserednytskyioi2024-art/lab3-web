import { useState, useEffect, useRef } from 'react';
import BuildingCard from '../components/BuildingCard';
import Budget from '../components/Budget';

// Смайлики для кожного типу будівлі
const ICONS = {
  'Житловий комплекс': '🏢',
  'Приватний будинок':  '🏠',
  'Гуртожиток':         '🏨',
  'Торговий центр':     '🏬',
  'Офісний центр':      '🏦',
  'Ринок':             '🛒',
  'Електростанція':     '⚡',
  'Завод':             '🏭',
  'Склад':             '🏗️',
};

// Смайлики при покращенні (рівень 1→2→3→4+)
const LEVEL_ICONS = {
  'Житловий комплекс': ['🏢','🏢✨','🏢🌟','🏢👑'],
  'Приватний будинок':  ['🏠','🏠✨','🏠🌟','🏠👑'],
  'Гуртожиток':         ['🏨','🏨✨','🏨🌟','🏨👑'],
  'Торговий центр':     ['🏬','🏬✨','🏬🌟','🏬👑'],
  'Офісний центр':      ['🏦','🏦✨','🏦🌟','🏦👑'],
  'Ринок':             ['🛒','🛒✨','🛒🌟','🛒👑'],
  'Електростанція':     ['⚡','⚡🔥','⚡💥','⚡👑'],
  'Завод':             ['🏭','🏭🔥','🏭💥','🏭👑'],
  'Склад':             ['🏗️','🏗️✨','🏗️🌟','🏗️👑'],
};

function getLevelIcon(name, level) {
  const arr = LEVEL_ICONS[name] || ['🏗️','🏗️✨','🏗️🌟','🏗️👑'];
  return arr[Math.min(level - 1, arr.length - 1)];
}

const allBuildings = [
  { id: 1, name: 'Житловий комплекс', type: 'житлові',    cost: 10000, description: '50 бетону | 2 буд.' },
  { id: 2, name: 'Приватний будинок',  type: 'житлові',    cost: 8000,  description: '30 бетону | 1 буд.' },
  { id: 3, name: 'Гуртожиток',         type: 'житлові',    cost: 6000,  description: '20 бетону | 1 буд.' },
  { id: 4, name: 'Торговий центр',     type: 'комерційні', cost: 20000, description: '80 бетону | 4 буд.' },
  { id: 5, name: 'Офісний центр',      type: 'комерційні', cost: 15000, description: '60 бетону | 3 буд.' },
  { id: 6, name: 'Ринок',             type: 'комерційні', cost: 5000,  description: '20 бетону | 2 буд.' },
  { id: 7, name: 'Електростанція',     type: 'промислові', cost: 50000, description: '100 металу | 5 буд.' },
  { id: 8, name: 'Завод',             type: 'промислові', cost: 30000, description: '80 металу | 4 буд.' },
  { id: 9, name: 'Склад',             type: 'промислові', cost: 12000, description: '40 металу | 2 буд.' },
];

const bgColors = ['#f4f4f9', '#dff9fb', '#fcf3cf', '#ebdef0', '#ffffff'];
const sectionStyle = { background: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const h2Style = { color: '#2c3e50', borderBottom: '2px solid #e67e22', paddingBottom: '10px' };
const tdStyle = { border: '1px solid #bdc3c7', padding: '8px', textAlign: 'center' };
function btnStyle(bg, width) {
  return { padding: '10px', background: bg, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: width || 'auto' };
}

export default function CityPage() {
  const [filter, setFilter]             = useState('всі');
  const [resources, setResources]       = useState({ budget: 1000000, concrete: 500, metal: 200, wood: 100, asphalt: 150, builders: 50 });
  const [builtObjects, setBuiltObjects] = useState([]);
  const [bgIndex, setBgIndex]           = useState(0);
  const mapRef     = useRef(null);
  const leafletMap = useRef(null);
  // Зберігаємо маркери по uid щоб оновлювати їх при покращенні
  const markersRef = useRef({});

  useEffect(() => {
    if (leafletMap.current) return;
    const L = window.L;
    if (!L || !mapRef.current) return;
    leafletMap.current = L.map(mapRef.current).setView([50.4500, 30.5200], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap'
    }).addTo(leafletMap.current);
  }, []);

  const filtered = filter === 'всі' ? allBuildings : allBuildings.filter(b => b.type === filter);

  function changeBg() {
    const next = (bgIndex + 1) % bgColors.length;
    setBgIndex(next);
    document.body.style.backgroundColor = bgColors[next];
  }

  function buildObject(building) {
    const L = window.L;
    const costMap = {
      'Електростанція':    { budget: 50000, builders: 5, metal: 100 },
      'Житловий комплекс': { budget: 10000, builders: 2, concrete: 50 },
    };
    const costs = costMap[building.name] || { budget: building.cost, builders: 2 };

    if (resources.budget   < (costs.budget   || 0)) return alert('Недостатньо бюджету!');
    if (resources.builders < (costs.builders || 0)) return alert('Недостатньо будівельників!');
    if (resources.concrete < (costs.concrete || 0)) return alert('Недостатньо бетону!');
    if (resources.metal    < (costs.metal    || 0)) return alert('Недостатньо металу!');

    setResources(r => ({
      ...r,
      budget:   r.budget   - (costs.budget   || 0),
      builders: r.builders - (costs.builders || 0),
      concrete: r.concrete - (costs.concrete || 0),
      metal:    r.metal    - (costs.metal    || 0),
    }));

    const uid = Date.now();
    const icon = ICONS[building.name] || '🏗️';

    // Додаємо маркер на карту і зберігаємо його в markersRef
    if (L && leafletMap.current) {
      const lat = 50.4500 + (Math.random() - 0.5) * 0.04;
      const lng = 30.5200 + (Math.random() - 0.5) * 0.08;
      const marker = L.marker([lat, lng]).addTo(leafletMap.current);
      marker.bindPopup(`<b>${icon} ${building.name}</b><br>Рівень: 1`).openPopup();
      markersRef.current[uid] = marker; // запам'ятовуємо маркер
    }

    setBuiltObjects(prev => [...prev, { ...building, uid, level: 1 }]);
  }

  function upgradeBuilding(uid) {
    if (resources.budget < 25000) return alert('Не вистачає бюджету!');
    setResources(r => ({ ...r, budget: r.budget - 25000 }));

    setBuiltObjects(prev => prev.map(o => {
      if (o.uid !== uid) return o;
      const newLevel = o.level + 1;

      // Оновлюємо маркер на карті
      const marker = markersRef.current[uid];
      if (marker) {
        const newIcon = getLevelIcon(o.name, newLevel);
        marker.setPopupContent(`<b>${newIcon} ${o.name}</b><br>Рівень: ${newLevel}`);
        marker.openPopup();
      }

      return { ...o, level: newLevel };
    }));
  }

  const prices = { concrete: 500, metal: 800, wood: 300, asphalt: 400, builders: 2000 };
  function buyResource(type) {
    const cost = prices[type];
    if (resources.budget < cost) return alert('Недостатньо бюджету!');
    setResources(r => ({ ...r, budget: r.budget - cost, [type]: r[type] + (type === 'builders' ? 1 : 10) }));
  }

  function showReport() {
    let text = "=== ЗВІТ ПРО МІСТО ===\n\n";
    text += `💰 Бюджет: ${resources.budget} ₴\n`;
    text += `🧱 Бетон: ${resources.concrete}т | ⚙️ Метал: ${resources.metal}т\n`;
    text += `🌳 Дерево: ${resources.wood}т | 🛣️ Асфальт: ${resources.asphalt}т\n`;
    text += `👷 Будівельники: ${resources.builders} осіб\n\n`;
    text += "--- ЗБУДОВАНІ ОБ'ЄКТИ ---\n";
    if (builtObjects.length === 0) { text += "Місто порожнє."; }
    else { builtObjects.forEach((o, i) => { text += `${i+1}. ${getLevelIcon(o.name, o.level)} ${o.name} (Рівень ${o.level})\n`; }); }
    alert(text);
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

      <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={changeBg}   style={btnStyle('#8e44ad')}>Змінити колір фону</button>
        <button onClick={showReport} style={btnStyle('#2980b9')}>Звіт про місто</button>
      </div>

      {/* ЗАКУПІВЛЯ */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Закупівля ресурсів</h2>
        <p>Тут ви можете придбати матеріали та найняти будівельників.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr>
              <th style={{ background: '#2c3e50', color: 'white', padding: '8px', border: '1px solid #bdc3c7' }}>Ресурс</th>
              <th style={{ background: '#2c3e50', color: 'white', padding: '8px', border: '1px solid #bdc3c7' }}>Ціна</th>
            </tr>
          </thead>
          <tbody>
            {[['Бетон','500₴/10т'],['Метал','800₴/10т'],['Дерево','300₴/10т'],['Асфальт','400₴/10т'],['Будівельник','2000₴/1 ос.']].map(([r,p]) => (
              <tr key={r}><td style={tdStyle}>{r}</td><td style={tdStyle}>{p}</td></tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginTop: '20px' }}>
          {[['concrete','Купити бетон (+10т)'],['metal','Купити метал (+10т)'],['wood','Купити дерево (+10т)'],['asphalt','Купити асфальт (+10т)'],['builders','Найняти будівельника (+1)']].map(([type,label]) => (
            <button key={type} onClick={() => buyResource(type)} style={btnStyle('#16a085')}>{label}</button>
          ))}
        </div>
      </section>

      {/* МОЄ МІСТО */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Моє місто</h2>
        <p>Тут відображається карта вашого мегаполісу.</p>
        <div style={{ border: '5px solid #7f8c8d', borderRadius: '8px', overflow: 'hidden' }}>
          <div ref={mapRef} style={{ height: '400px', width: '100%' }} />
        </div>

        <h3 style={{ marginTop: '20px' }}>Доступні об'єкти</h3>
        <p style={{ color: '#666' }}>Знайдено: {filtered.length}</p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['всі','житлові','комерційні','промислові'].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: filter === cat ? '#2c3e50' : '#e0e0e0',
              color:      filter === cat ? 'white'   : 'black',
              fontWeight: filter === cat ? 'bold'    : 'normal',
            }}>{cat}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {filtered.map(b => (
            <div key={b.id} onClick={() => buildObject(b)} title="Натисніть щоб побудувати" style={{ cursor: 'pointer' }}>
              <BuildingCard name={b.name} type={b.type} cost={b.cost} description={b.description} />
            </div>
          ))}
        </div>
      </section>

      {/* МОЇ БУДІВЛІ */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Мої збудовані об'єкти</h2>
        {builtObjects.length === 0
          ? <p style={{ color: '#7f8c8d' }}>Поки що нічого не збудовано.</p>
          : <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
              {builtObjects.map(obj => {
                const levelIcon = getLevelIcon(obj.name, obj.level);
                // Колір картки залежно від рівня
                const cardBg = obj.level === 1 ? '#fff'
                             : obj.level === 2 ? '#fff9e6'
                             : obj.level === 3 ? '#e8f5e9'
                             : '#fce4ec';
                const borderColor = obj.level === 1 ? '#34495e'
                                  : obj.level === 2 ? '#f39c12'
                                  : obj.level === 3 ? '#27ae60'
                                  : '#e74c3c';
                return (
                  <div key={obj.uid} style={{
                    border: `2px solid ${borderColor}`, padding: '10px', borderRadius: '8px',
                    textAlign: 'center', background: cardBg, width: '160px',
                    transition: 'all 0.3s'
                  }}>
                    {/* Великий смайлик — унікальний для кожної будівлі */}
                    <div style={{ fontSize: '45px', lineHeight: 1, marginBottom: '8px' }}>
                      {levelIcon}
                    </div>
                    <h4 style={{ margin: '5px 0', fontSize: '0.85rem' }}>{obj.name}</h4>
                    {/* Зірочки рівня */}
                    <p style={{ margin: '4px 0', color: '#f39c12', fontSize: '1rem' }}>
                      {'⭐'.repeat(Math.min(obj.level, 4))}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>Рівень: <b>{obj.level}</b></p>
                    <p style={{ fontSize: '0.8rem', color: 'green', margin: '4px 0' }}>+{obj.level * 2500}₴</p>
                    <button onClick={() => upgradeBuilding(obj.uid)} style={btnStyle('#e67e22', '100%')}>
                      Покращити (-25000₴)
                    </button>
                  </div>
                );
              })}
            </div>
        }
      </section>

      {/* РЕСУРСИ */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Ресурси міста</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '10px' }}>
          <Budget amount={resources.budget} />
          <div style={{ background: '#ecf0f1', padding: '15px', borderRadius: '5px', flex: 1, minWidth: '200px', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Матеріали</h3>
            <p>Бетон: <b>{resources.concrete}</b>т | Метал: <b>{resources.metal}</b>т</p>
            <p>Дерево: <b>{resources.wood}</b>т | Асфальт: <b>{resources.asphalt}</b>т</p>
          </div>
          <div style={{ background: '#ecf0f1', padding: '15px', borderRadius: '5px', flex: 1, minWidth: '200px', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Будівельники</h3>
            <p style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>{resources.builders} осіб</p>
          </div>
        </div>
      </section>

    </div>
  );
}