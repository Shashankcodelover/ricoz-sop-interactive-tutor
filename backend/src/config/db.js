const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ricoz_sop_tutor';
    const conn = await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    // Don't crash in local dev without mongo running immediately, log warning
    console.warn('[MongoDB] Running with in-memory fallback / disconnected mode if local Mongo is inactive.');
  }
};

module.exports = connectDB;

