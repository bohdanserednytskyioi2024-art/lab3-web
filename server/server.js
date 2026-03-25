const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { db } = require('./firebaseConfig');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Хостинг статичних файлів React
app.use(express.static(path.join(__dirname, '../lab3/build')));

// Rate limiter — виправлено для IPv6
const saveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: {
    error: 'Збереження можливе лише раз на хвилину. Спробуйте пізніше.'
  },
  keyGenerator: (req) => {
    // Виправлення ERR_ERL_KEY_GEN_IPV6
    return req.body.userId || req.ip.replace(/:/g, '_');
  },
  validate: { xForwardedForHeader: false }
});

// GET /api/buildings
app.get('/api/buildings', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId обовязковий' });
    }
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('buildings')
      .where('level', '>', 1)
      .get();

    const buildings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ buildings });
  } catch (err) {
    console.error('GET /api/buildings error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// POST /api/buildings/upgrade
app.post('/api/buildings/upgrade', saveLimiter, async (req, res) => {
  try {
    const { userId, buildingId, level, name, type } = req.body;
    if (!userId || !buildingId) {
      return res.status(400).json({ error: 'userId і buildingId обовязкові' });
    }
    await db
      .collection('users')
      .doc(userId)
      .collection('buildings')
      .doc(buildingId)
      .update({
        level,
        name,
        type,
        upgradedAt: new Date().toISOString()
      });

    res.json({
      success: true,
      message: `Будівля "${name}" покращена до рівня ${level}`,
      building: { id: buildingId, level, name, type }
    });
  } catch (err) {
    console.error('POST /api/buildings/upgrade error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Виправлено для нової версії Express — замість '*'
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../lab3/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});