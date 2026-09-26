const mongoose = require('mongoose');
const logger = require('../utils/logger');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  try {
    if (uri && uri !== 'memory') {
      logger.info(`Attempting connection to MongoDB at: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000
      });
      logger.info('Connected to configured MongoDB database.');
      return;
    }
  } catch (err) {
    logger.warn(`Could not connect to external MongoDB: ${err.message}. Initializing embedded MongoDB engine...`);
  }

  // Fallback to MongoMemoryServer for flawless zero-config local run
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    logger.info('Starting embedded MongoDB instance...');
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'eventify_db'
      }
    });
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    logger.info(`Connected to embedded MongoDB database: ${memUri}`);
  } catch (memErr) {
    logger.error('Failed to initialize embedded MongoDB server:', memErr);
    throw memErr;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
