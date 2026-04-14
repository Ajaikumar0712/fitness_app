const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ─── CORS ───────────────────────────────────────────────────────────────────
// Build a list of all allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://fitness-app1-three.vercel.app',   // your deployed frontend
  process.env.CLIENT_URL,                    // also from env var
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman / curl / same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle OPTIONS preflight for ALL routes FIRST
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json());

// Explicit fallback for any OPTIONS that slip through
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://fitness-app1-three.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});


// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/health',   require('./routes/health'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/diet',     require('./routes/diet'));
app.use('/api/goals',    require('./routes/goals'));
app.use('/api/alerts',   require('./routes/alerts'));

app.get('/',    (req, res) => res.json({ msg: '✅ SmartFit API v1.0 Running', status: 'ok' }));
app.get('/api', (req, res) => res.json({ msg: '✅ SmartFit API v1.0 Running', status: 'ok' }));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));

// ─── Local dev server ────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 SmartFit Server on port ${PORT}`));
}

module.exports = app;
