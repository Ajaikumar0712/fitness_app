const mongoose = require('mongoose');

// Cache the connection across serverless invocations (Vercel best practice)
let cached = global.__mongoose;
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return existing connection if already established
  if (cached.conn) return cached.conn;

  // If no pending connection, start one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log(`✅ MongoDB Connected`);
    return cached.conn;
  } catch (err) {
    // Reset promise so next invocation can retry
    cached.promise = null;
    // Do NOT call process.exit() — it kills the serverless function
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    throw err; // Let the route handler return a 500 error instead
  }
};

module.exports = connectDB;
