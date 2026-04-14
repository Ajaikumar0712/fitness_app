const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// CORS — allow local dev + production Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl) or from allowed list
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/health',   require('./routes/health'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/diet',     require('./routes/diet'));
app.use('/api/goals',    require('./routes/goals'));
app.use('/api/alerts',   require('./routes/alerts'));

app.get('/',  (req, res) => res.json({ msg: '✅ SmartFit API v1.0 Running', status: 'ok' }));
app.get('/api', (req, res) => res.json({ msg: '✅ SmartFit API v1.0 Running', status: 'ok' }));

// 404
app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));

// Local dev — only listen if not in Vercel serverless
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 SmartFit Server running on port ${PORT}`));
}

// Export for Vercel serverless
module.exports = app;
