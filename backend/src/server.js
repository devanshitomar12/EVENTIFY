const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const { connectDB } = require('./config/db');
const { initMailer } = require('./config/mailer');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    // Auto-seed if database is fresh/empty
    const Event = require('./models/Event');
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      logger.info('Database is empty. Auto-seeding initial events and users...');
      const { seedData } = require('./seed');
      await seedData();
    }

    // Initialize Mailer service
    await initMailer();

    // Start Express listener
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Eventify API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });

    // Handle Unhandled Promise Rejections gracefully
    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`, err.stack);
      // Keep server alive in development
      if (process.env.NODE_ENV === 'production') {
        server.close(() => process.exit(1));
      }
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught Exception: ${err.message}`, err.stack);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
