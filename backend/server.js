const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const musicRoutes = require('./routes/music');
const userRoutes = require('./routes/user'); // Import user routes
const os = require('os');

const app = express();
const port = process.env.PORT || 3000;

// Get local IP addresses
const getLocalIPs = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((interface) => {
      // Skip internal and non-IPv4 addresses
      if (!interface.internal && interface.family === 'IPv4') {
        addresses.push(interface.address);
      }
    });
  });
  
  return addresses;
};

// Enable better logging in development
app.use(morgan('dev'));

// Enhanced CORS configuration
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', musicRoutes); // Music routes (e.g., /api/songs, /api/artists)
app.use('/api/user', userRoutes); // Mount user routes (e.g., /api/user/likes)

// Health check route with detailed info
app.get('/health', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    clientIp,
    serverIps: getLocalIPs(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route for basic connection test
app.get('/', (req, res) => {
  res.send('Server is running. Try /health for more info.');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Initialize database and start server
sequelize.sync().then(() => {
  console.log('Database synced');
  
  // Listen on all network interfaces
  app.listen(port, '0.0.0.0', () => {
    const localIps = getLocalIPs();
    console.log('\n=== Server Information ===');
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
    
    if (localIps.length === 0) {
      console.log('\nWarning: No network interfaces found!');
    } else {
      console.log('\nServer is accessible at these URLs:');
      localIps.forEach(ip => {
        console.log('\nNetwork URLs for', ip + ':');
        console.log(` - API Base URL: http://${ip}:${port}/api`);
        console.log(` - Health check: http://${ip}:${port}/health`);
        // console.log(` - Documentation: http://${ip}:${port}/api/docs`); // Commented out if no docs yet
      });
    }
    
    console.log('\nAPI Endpoints:');
    console.log(' - Auth:');
    console.log('   POST /api/auth/signup');
    console.log('   POST /api/auth/login');
    console.log('   POST /api/auth/logout');
    console.log('\n - Music:');
    console.log('   GET  /api/artists');
    console.log('   GET  /api/albums');
    console.log('   GET  /api/songs');
    console.log('   GET  /api/songs/popular');
    console.log('\n - User:'); // Added User endpoints info
    console.log('   GET  /api/user/likes');
    console.log('   POST /api/user/likes');
    console.log('   DELETE /api/user/likes/:songId');
    console.log('\n=========================');
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
  process.exit(1);
});
