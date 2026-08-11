require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', chatRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'StudyBuddy AI Server' }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🎓 StudyBuddy AI Server running on http://localhost:${PORT}`);
  console.log(`📡 OpenRouter API key: ${process.env.OPENROUTER_API_KEY ? '✅ Configured' : '❌ MISSING — add to .env'}`);
  console.log(`🌐 Accepting requests from: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});
