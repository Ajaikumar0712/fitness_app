const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const connectDB  = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/health',   require('./routes/health'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/diet',     require('./routes/diet'));
app.use('/api/goals',    require('./routes/goals'));
app.use('/api/alerts',   require('./routes/alerts'));

app.get('/', (req, res) => res.json({ msg: '✅ SmartFit API Running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SmartFit Server running on port ${PORT}`));
