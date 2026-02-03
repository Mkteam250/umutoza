// server.js (your main file)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './src/routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config({ path: './enve.env' });
import connectDB from './src/db.js';

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Ensure logs directory exists
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ✅ POWERFUL LOGGER
const logError = (type, error) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    message: error.message,
    stack: error.stack,
    url: error.url || '',
    method: error.method || ''
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  console.error(`[CRITICAL ERROR] ${type}:`, error);

  // Append to error log file
  fs.appendFileSync(path.join(LOG_DIR, 'errors.log'), logLine);
};

// ✅ GLOBAL ERROR CATCHERS — NEVER CRASH
process.on('uncaughtException', (err) => {
  logError('UNCAUGHT_EXCEPTION', err);
  console.error('💥 Uncaught Exception — Server is still running!');
});

process.on('unhandledRejection', (reason, promise) => {
  logError('UNHANDLED_REJECTION', reason);
  console.error('💥 Unhandled Rejection — Server is still running!', { reason, promise });
});

app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('running');
});

// ✅ GLOBAL ERROR HANDLER (for next(err))
app.use((err, req, res, next) => {
  logError('ROUTE_ERROR', { ...err, url: req.url, method: req.method });
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ START SERVER
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('✅ Crash-proof mode: ACTIVE');
  console.log('📁 Error logs: ./logs/errors.log');
  console.log('='.repeat(60));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});