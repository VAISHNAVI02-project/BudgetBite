const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
require('dotenv').config();

// Database initialization
require('./config/db');

// Middleware
const errorHandler = require('./middleware/errorHandler');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const comboRoutes = require('./routes/comboRoutes');
const orderRoutes = require('./routes/orderRoutes');
const profileRoutes = require('./routes/profileRoutes');
const customerRoutes = require('./routes/customerRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration supporting localhost and Local Area / Wi-Fi network IPs (for mobile testing)
const allowedOriginRegex = /^(https:\/\/[a-z0-9-]+\.vercel\.app|http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?)$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOriginRegex.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Root & Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'BudgetBite API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/combos', comboRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on BudgetBite API server.`
  });
});

// Centralized error handler
app.use(errorHandler);

// Helper to retrieve local IPv4 addresses
const getLocalIPs = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
};

// Start server on 0.0.0.0 to allow mobile testing on same Wi-Fi
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BudgetBite] Server is running on:`);
  console.log(`  ➜ Local:   http://localhost:${PORT}`);
  const localIps = getLocalIPs();
  localIps.forEach((ip) => {
    console.log(`  ➜ Network: http://${ip}:${PORT}`);
  });
  console.log(`[BudgetBite] Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
