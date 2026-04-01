const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

import { useState, useEffect, useRef } from 'react';
import {
  collection, addDoc, getDocs, doc,
  updateDoc, setDoc, getDoc, deleteDoc, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import BuildingCard from '../components/BuildingCard';
import Budget from '../components/Budget';

const ICONS = {
  'Житловий комплекс': '🏢', 'Приватний будинок': '🏠', 'Гуртожиток': '🏨',
  'Торговий центр': '🏬', 'Офісний центр': '🏦', 'Ринок': '🛒',
  'Електростанція': '⚡', 'Завод': '🏭', 'Склад': '🏗️',
  'Парк':  '🌳',
  'Дорога': '🛣️',
};
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
  'Парк':  ['🌳','🌳✨','🌳🌟','🌳👑'],
  'Дорога': ['🛣️','🛣️✨','🛣️🌟','🛣️👑'],
};
function getLevelIcon(name, level) {
  const arr = LEVEL_ICONS[name] || ['🏗️','🏗️✨','🏗️🌟','🏗️👑'];
  return arr[Math.min(level - 1, arr.length - 1)];
}

const allBuildings = [
  { id: 1,  name: 'Житловий комплекс', type: 'житлові',    cost: 10000, description: '50 бетону | 2 буд.' },
  { id: 2,  name: 'Приватний будинок',  type: 'житлові',    cost: 8000,  description: '30 бетону | 1 буд.' },
  { id: 3,  name: 'Гуртожиток',         type: 'житлові',    cost: 6000,  description: '20 бетону | 1 буд.' },
  { id: 4,  name: 'Парк',              type: 'житлові',    cost: 7000,  description: '30 дерева | 2 буд.' },
  { id: 5,  name: 'Торговий центр',     type: 'комерційні', cost: 20000, description: '80 бетону | 4 буд.' },
  { id: 6,  name: 'Офісний центр',      type: 'комерційні', cost: 15000, description: '60 бетону | 3 буд.' },
  { id: 7,  name: 'Ринок',             type: 'комерційні', cost: 5000,  description: '20 бетону | 2 буд.' },
  { id: 8,  name: 'Дорога',            type: 'комерційні', cost: 8000,  description: '40 асфальту | 2 буд.' },
  { id: 9,  name: 'Електростанція',     type: 'промислові', cost: 50000, description: '100 металу | 5 буд.' },
  { id: 10, name: 'Завод',             type: 'промислові', cost: 30000, description: '80 металу | 4 буд.' },
  { id: 11, name: 'Склад',             type: 'промислові', cost: 12000, description: '40 металу | 2 буд.' },
];

const DEFAULT_RESOURCES = {
  budget: 1000000, concrete: 500, metal: 200,
  wood: 100, asphalt: 150, builders: 50
};

const bgColors = ['#f4f4f9','#dff9fb','#fcf3cf','#ebdef0','#ffffff'];

const sectionStyle = { background: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const h2Style = { color: '#2c3e50', borderBottom: '2px solid #e67e22', paddingBottom: '10px' };
const tdStyle = { border: '1px solid #bdc3c7', padding: '8px', textAlign: 'center' };
function btnStyle(bg, width) {
  return { padding: '10px', background: bg, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: width || 'auto' };
}

export default function CityPage({ user }) {
  const [filter, setFilter]             = useState('всі');
  const [resources, setResources]       = useState(DEFAULT_RESOURCES);
  const [builtObjects, setBuiltObjects] = useState([]);
  const [bgIndex, setBgIndex]           = useState(0);
  const [dataLoaded, setDataLoaded]     = useState(false);
  const mapRef      = useRef(null);
  const leafletMap  = useRef(null);
  const markersRef  = useRef({});

  // Ініціалізація карти
  useEffect(() => {
    if (leafletMap.current) return;
    const L = window.L;
    if (!L || !mapRef.current) return;
    leafletMap.current = L.map(mapRef.current).setView([50.4500, 30.5200], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap'
    }).addTo(leafletMap.current);
  }, []);

  // Завантаження даних з Firestore при логіні
  useEffect(() => {
    if (!user) return;
    async function loadData() {
      setDataLoaded(false);

      // Завантажуємо ресурси
      const resDoc = await getDoc(doc(db, 'users', user.uid, 'state', 'resources'));
      if (resDoc.exists()) {
        setResources(resDoc.data());
      } else {
        // Перший вхід — створюємо дефолтні ресурси
        await setDoc(doc(db, 'users', user.uid, 'state', 'resources'), DEFAULT_RESOURCES);
        setResources(DEFAULT_RESOURCES);
      }

      // Завантажуємо будівлі
      const buildSnap = await getDocs(collection(db, 'users', user.uid, 'buildings'));
      const loaded = buildSnap.docs.map(d => ({ ...d.data(), uid: d.id }));
      setBuiltObjects(loaded);

      // Розставляємо маркери на карті
      setTimeout(() => {
        const L = window.L;
        if (!L || !leafletMap.current) return;
        // Очищаємо старі маркери
        Object.values(markersRef.current).forEach(m => m.remove());
        markersRef.current = {};
        // Додаємо нові
        loaded.forEach(obj => {
          if (obj.lat && obj.lng) {
            const marker = L.marker([obj.lat, obj.lng]).addTo(leafletMap.current);
            marker.bindPopup(`<b>${getLevelIcon(obj.name, obj.level)} ${obj.name}</b><br>Рівень: ${obj.level}`);
            markersRef.current[obj.uid] = marker;
          }
        });
      }, 500);

      setDataLoaded(true);
    }
    loadData();
  }, [user]);

  // Збереження ресурсів у Firestore при кожній зміні
  useEffect(() => {
    if (!user || !dataLoaded) return;
    setDoc(doc(db, 'users', user.uid, 'state', 'resources'), resources);
  }, [resources, user, dataLoaded]);

 // Завантаження покращених будівель з Node.js сервера
useEffect(() => {
  if (!user) return;

  async function loadUpgraded() {
    try {
      const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://city-simulator-server.onrender.com';
      const res = await fetch(`${SERVER_URL}/api/buildings?userId=${user.uid}`);
      const data = await res.json();

      if (data.buildings && data.buildings.length > 0) {
        console.log('Дані з сервера (GET):', data.buildings);
        
        setBuiltObjects(prev => prev.map(obj => {
          const fromServer = data.buildings.find(b => b.id === obj.uid);
          
          if (fromServer) {
            // Оновлюємо маркер на карті, якщо він є
            if (markersRef && markersRef.current) {
                const marker = markersRef.current[obj.uid];
                if (marker) {
                  marker.setPopupContent(`<b>${getLevelIcon(obj.name, fromServer.level)} ${obj.name}</b><br>Рівень: ${fromServer.level}`);
                }
            }
            return { ...obj, level: fromServer.level };
          }
          return obj;
        }));
      }
    } catch (err) {
      console.error('Помилка завантаження з сервера:', err);
    }
  }

  loadUpgraded();
}, [user]);

  const filtered = filter === 'всі' ? allBuildings : allBuildings.filter(b => b.type === filter);

  function changeBg() {
    const next = (bgIndex + 1) % bgColors.length;
    setBgIndex(next);
    document.body.style.backgroundColor = bgColors[next];
  }

  async function buildObject(building) {
    if (!user) return alert('Спочатку увійдіть в систему!');
    const L = window.L;

    // Витрати для кожної будівлі
    const costMap = {
      'Житловий комплекс': { budget: 10000, builders: 2, concrete: 50, metal: 0, wood: 0, asphalt: 0 },
      'Приватний будинок':  { budget: 8000,  builders: 1, concrete: 30, metal: 0, wood: 0, asphalt: 0 },
      'Гуртожиток':         { budget: 6000,  builders: 1, concrete: 20, metal: 0, wood: 0, asphalt: 0 },
      'Торговий центр':     { budget: 20000, builders: 4, concrete: 80, metal: 0, wood: 0, asphalt: 0 },
      'Офісний центр':      { budget: 15000, builders: 3, concrete: 60, metal: 0, wood: 0, asphalt: 0 },
      'Ринок':             { budget: 5000,  builders: 2, concrete: 20, metal: 0, wood: 0, asphalt: 0 },
      'Електростанція':     { budget: 50000, builders: 5, concrete: 0, metal: 100, wood: 0, asphalt: 0 },
      'Завод':             { budget: 30000, builders: 4, concrete: 0, metal: 80,  wood: 0, asphalt: 0 },
      'Склад':             { budget: 12000, builders: 2, concrete: 0, metal: 40,  wood: 0, asphalt: 0 },
      'Парк':   { budget: 7000,  builders: 2, concrete: 0, metal: 0, wood: 30,  asphalt: 0  },
      'Дорога': { budget: 8000,  builders: 2, concrete: 0, metal: 0, wood: 0,   asphalt: 40 },
    };
    const costs = costMap[building.name] || { budget: building.cost, builders: 2, concrete: 0, metal: 0, wood: 0, asphalt: 0 };

    // Перевірка всіх ресурсів
    if (resources.budget   < costs.budget)   return alert(`Недостатньо бюджету! Потрібно ${costs.budget}₴`);
    if (resources.builders < costs.builders) return alert(`Недостатньо будівельників! Потрібно ${costs.builders}`);
    if (resources.concrete < costs.concrete) return alert(`Недостатньо бетону! Потрібно ${costs.concrete}т`);
    if (resources.metal    < costs.metal)    return alert(`Недостатньо металу! Потрібно ${costs.metal}т`);
    if (resources.wood     < costs.wood)     return alert(`Недостатньо дерева! Потрібно ${costs.wood}т`);
    if (resources.asphalt  < costs.asphalt)  return alert(`Недостатньо асфальту! Потрібно ${costs.asphalt}т`);

    // Знімаємо ресурси
    const newResources = {
      ...resources,
      budget:   resources.budget   - costs.budget,
      builders: resources.builders - costs.builders,
      concrete: resources.concrete - costs.concrete,
      metal:    resources.metal    - costs.metal,
      wood:     resources.wood     - costs.wood,
      asphalt:  resources.asphalt  - costs.asphalt,
    };
    setResources(newResources);

    // Координати для маркера
    const lat = 50.4500 + (Math.random() - 0.5) * 0.04;
    const lng = 30.5200 + (Math.random() - 0.5) * 0.08;

    // Зберігаємо будівлю у Firestore
    const newBuilding = {
      ...building, level: 1,
      lat, lng,
      addedBy: user.email,
    };
    const docRef = await addDoc(collection(db, 'users', user.uid, 'buildings'), newBuilding);

    // Маркер на карту
    if (L && leafletMap.current) {
      const marker = L.marker([lat, lng]).addTo(leafletMap.current);
      marker.bindPopup(`<b>${ICONS[building.name]} ${building.name}</b><br>Рівень: 1`).openPopup();
      markersRef.current[docRef.id] = marker;
    }

    setBuiltObjects(prev => [...prev, { ...newBuilding, uid: docRef.id }]);
  }

  async function upgradeBuilding(uid) {
  if (!user) return alert('Спочатку увійдіть!');
  if (resources.budget < 25000) return alert('Не вистачає бюджету! Потрібно 25000₴');

  const obj = builtObjects.find(o => o.uid === uid);
  const newLevel = obj.level + 1;

  // Оновлюємо бюджет локально і в Firestore
  setResources(r => ({ ...r, budget: r.budget - 25000 }));
  await updateDoc(doc(db, 'users', user.uid, 'buildings', uid), { level: newLevel });

  // POST запит на сервер (з rate limit 1 раз/хвилину)
  try {
    const response = await fetch(`${SERVER_URL}/api/buildings/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId:     user.uid,
        buildingId: uid,
        level:      newLevel,
        name:       obj.name,
        type:       obj.type,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Rate limit спрацював
      alert(`⚠️ ${data.error}`);
    }
  } catch (err) {
    console.error('Помилка збереження на сервері:', err);
  }

  // Оновлюємо стан і маркер на карті
  setBuiltObjects(prev => prev.map(o => {
    if (o.uid !== uid) return o;
    const marker = markersRef.current[uid];
    if (marker) {
      marker.setPopupContent(`<b>${getLevelIcon(o.name, newLevel)} ${o.name}</b><br>Рівень: ${newLevel}`);
      marker.openPopup();
    }
    return { ...o, level: newLevel };
  }));
}

  const prices = { concrete: 500, metal: 800, wood: 300, asphalt: 400, builders: 2000 };
  function buyResource(type) {
    if (!user) return alert('Спочатку увійдіть!');
    const cost = prices[type];
    if (resources.budget < cost) return alert('Недостатньо бюджету!');
    setResources(r => ({
      ...r,
      budget: r.budget - cost,
      [type]: r[type] + (type === 'builders' ? 1 : 10),
    }));
  }

  // Скидання всього до нуля
  async function resetAll() {
    if (!user) return;
    if (!window.confirm('Ти впевнений? Всі будівлі та ресурси будуть скинуті до початкового стану!')) return;

    // Видаляємо всі будівлі
    const buildSnap = await getDocs(collection(db, 'users', user.uid, 'buildings'));
    const batch = writeBatch(db);
    buildSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();

    // Скидаємо ресурси
    await setDoc(doc(db, 'users', user.uid, 'state', 'resources'), DEFAULT_RESOURCES);

    // Очищаємо маркери з карти
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    setBuiltObjects([]);
    setResources(DEFAULT_RESOURCES);
    alert('✅ Місто скинуто до початкового стану!');
  }

  function showReport() {
    let text = "=== ЗВІТ ПРО МІСТО ===\n\n";
    text += `💰 Бюджет: ${resources.budget}₴\n`;
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

      <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={changeBg}   style={btnStyle('#8e44ad')}>Змінити колір фону</button>
        <button onClick={showReport} style={btnStyle('#2980b9')}>Звіт про місто</button>
        <button onClick={resetAll}   style={btnStyle('#e74c3c')}>🔄 Почати з нуля</button>
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
              color: filter === cat ? 'white' : 'black',
              fontWeight: filter === cat ? 'bold' : 'normal',
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
          ? <p style={{ color: '#7f8c8d' }}>Поки що нічого не збудовано. Натисніть на об'єкт вище щоб побудувати.</p>
          : <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
              {builtObjects.map(obj => {
                const levelIcon = getLevelIcon(obj.name, obj.level);
                const cardBg = obj.level === 1 ? '#fff' : obj.level === 2 ? '#fff9e6' : obj.level === 3 ? '#e8f5e9' : '#fce4ec';
                const borderColor = obj.level === 1 ? '#34495e' : obj.level === 2 ? '#f39c12' : obj.level === 3 ? '#27ae60' : '#e74c3c';
                return (
                  <div key={obj.uid} style={{ border: `2px solid ${borderColor}`, padding: '10px', borderRadius: '8px', textAlign: 'center', background: cardBg, width: '160px' }}>
                    <div style={{ fontSize: '40px', lineHeight: 1, marginBottom: '8px' }}>{levelIcon}</div>
                    <h4 style={{ margin: '5px 0', fontSize: '0.85rem' }}>{obj.name}</h4>
                    <p style={{ margin: '4px 0', color: '#f39c12' }}>{'⭐'.repeat(Math.min(obj.level, 4))}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>Рівень: <b>{obj.level}</b></p>
                    <p style={{ fontSize: '0.8rem', color: 'green', margin: '4px 0' }}>+{obj.level * 2500}₴/міс</p>
                    <button onClick={() => upgradeBuilding(obj.uid)} style={btnStyle('#e67e22', '100%')}>
                      Покращити (-25000₴)
                    </button>
                  </div>
                );
              })}
            </div>
        }
      </section>

      {/* НОВИЙ БЛОК: ДЕМОНСТРАЦІЯ ВИКЛАДАЧУ (GET-ЗАПИТ) */}
      <section style={{ ...sectionStyle, border: '3px solid #27ae60', backgroundColor: '#eafaf1' }}>
        <h2 style={{ ...h2Style, borderBottomColor: '#27ae60' }}>🏢 Дані з Node.js сервера (GET-запит)</h2>
        <p style={{ color: '#2c3e50', marginBottom: '15px' }}>
          Тут відображаються покращені будівлі, завантажені напряму з API сервера на Render.
        </p>
        {builtObjects.filter(b => b.level > 1).length > 0 ? (
          <ul style={{ paddingLeft: '20px', margin: 0, listStyleType: 'square' }}>
            {builtObjects.filter(b => b.level > 1).map(b => (
              <li key={b.uid} style={{ marginBottom: '8px', fontSize: '16px' }}>
                {getLevelIcon(b.name, b.level)} <strong>{b.name}</strong> — Покращено до <b>{b.level}</b> рівня 
                <span style={{ color: '#7f8c8d', fontSize: '14px' }}> (ID: {b.uid.slice(0, 5)}...)</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, color: '#e74c3c', fontWeight: 'bold' }}>
            Поки немає покращених будівель. Спробуйте покращити щось у списку вище!
          </p>
        )}
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