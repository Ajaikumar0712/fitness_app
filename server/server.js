const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://fitness-app1-three.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Vercel path-to-regexp requires wildcards to be (.*) instead of *
app.options('(.*)', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

// ─── DB Middleware — connect before every request ─────────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(503).json({ msg: 'Database unavailable. Check MONGO_URI env variable.' });
  }
});

// Explicit fallback for OPTIONS (middleware layer)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || 'https://fitness-app1-three.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/health',   require('./routes/health'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/diet',     require('./routes/diet'));
app.use('/api/goals',    require('./routes/goals'));
app.use('/api/alerts',   require('./routes/alerts'));

// Health check
app.get('/',    (req, res) => res.json({ msg: '✅ SmartFit API v1.0', status: 'ok', env: process.env.NODE_ENV }));
app.get('/api', (req, res) => res.json({ msg: '✅ SmartFit API v1.0', status: 'ok' }));

// ─── 404 ─────────────────────────────────────────────────────────────────────
// Use (.*) for wildcard or just define as last middleware without path
app.use((req, res) => {
  res.status(404).json({ msg: `Route not found: ${req.method} ${req.path}` });
});

// ─── Local dev only ───────────────────────────────────────────────────────────
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  connectDB(); 
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 SmartFit Server on port ${PORT}`));
}

module.exports = app;
