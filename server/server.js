const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { db } = require('./firebaseConfig');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rate limiter — повністю виправлено для IPv6
const saveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: { error: 'Збереження можливе лише раз на хвилину. Спробуйте пізніше.' },
  keyGenerator: (req) => req.body.userId || 'anonymous',
  skip: () => false,
  validate: false  // вимикаємо всі валідації
});

// GET /api/buildings
app.get('/api/buildings', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId обовязковий' });

    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('buildings')
      .where('level', '>', 1)
      .get();

    const buildings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ buildings });
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// POST /api/buildings/upgrade
app.post('/api/buildings/upgrade', saveLimiter, async (req, res) => {
  try {
    const { userId, buildingId, level, name, type } = req.body;
    if (!userId || !buildingId) return res.status(400).json({ error: 'userId і buildingId обовязкові' });

    await db
      .collection('users')
      .doc(userId)
      .collection('buildings')
      .doc(buildingId)
      .update({ level, name, type, upgradedAt: new Date().toISOString() });

    res.json({ success: true, message: `Будівля "${name}" покращена до рівня ${level}` });
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Тестовий маршрут
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на порті ${PORT}`);
});