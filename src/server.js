require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const discoveryRoutes = require('./routes/discovery');
const analysisRoutes = require('./routes/analysis');
const generationRoutes = require('./routes/generation');
const outreachRoutes = require('./routes/outreach');
const demoRoutes = require('./routes/demo');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for demos
app.use('/demos', express.static(path.join(__dirname, '../demos/generated')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../templates'));

// Routes
app.use('/api/discovery', discoveryRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/generation', generationRoutes);
app.use('/api/outreach', outreachRoutes);
app.use('/demo', demoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Home page
app.get('/', (req, res) => {
  res.json({
    message: 'Website Rescue Platform API',
    version: '1.0.0',
    endpoints: {
      discovery: '/api/discovery',
      analysis: '/api/analysis',
      generation: '/api/generation',
      outreach: '/api/outreach',
      demos: '/demo/:id'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Initialize database and start server
const db = require('./database/db');
db.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Website Rescue Platform running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;
