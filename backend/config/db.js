import mongoose from 'mongoose';

let connectionStatus = 'disconnected';
let lastError = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.warn("⚠️  [Database Notice] MONGODB_URI not configured. Operating in degraded mode with disk persistence.");
    connectionStatus = 'degraded';
    return { status: 'MongoDB degraded', message: 'MONGODB_URI not configured - degraded disk persistence active' };
  }

  try {
    mongoose.set('strictQuery', true);

    // Ensure connection targets 'scamshield' database and gives Atlas sufficient timeout
    await mongoose.connect(uri, {
      dbName: 'scamshield',
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    connectionStatus = 'connected';
    lastError = null;
    console.log("✅ [Database Connected] MongoDB connected successfully.");
    console.log(`🛡️  Target Database: ${mongoose.connection.name || 'scamshield'}`);
    return { status: 'MongoDB connected', database: mongoose.connection.name || 'scamshield' };
  } catch (err) {
    connectionStatus = 'degraded';
    // Sanitize any credential strings from the error message
    const sanitizedError = (err.message || '').replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, 'mongodb$1://<credentials-hidden>@');
    lastError = sanitizedError;
    console.warn(`⚠️  [Database Degraded] MongoDB connection failed: ${sanitizedError}. Operating in degraded mode with disk persistence.`);
    return { status: 'MongoDB degraded', error: sanitizedError };
  }
}

export function getDatabaseStatus() {
  const isConnected = mongoose.connection.readyState === 1;
  let displayStatus;

  if (isConnected) {
    displayStatus = 'MongoDB connected';
  } else if (connectionStatus === 'degraded') {
    displayStatus = 'MongoDB degraded';
  } else {
    displayStatus = 'MongoDB unavailable';
  }

  return {
    status: displayStatus,
    rawStatus: connectionStatus,
    isConnectedToMongo: isConnected,
    isDegraded: !isConnected && connectionStatus === 'degraded',
    databaseName: isConnected ? (mongoose.connection.name || 'scamshield') : null,
    error: lastError,
    activeEngine: isConnected ? 'MongoDB Atlas + Mongoose' : 'Degraded Mode (Disk-Backed File Persistence)'
  };
}

mongoose.connection.on('disconnected', () => {
  if (connectionStatus === 'connected') {
    connectionStatus = 'degraded';
    console.warn("⚠️  [Database Alert] Lost connection to MongoDB. Reverting to degraded storage mode.");
  }
});

mongoose.connection.on('reconnected', () => {
  connectionStatus = 'connected';
  console.log("✅ [Database Alert] Reconnected to MongoDB.");
});

