const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const userRoutes = require('./routes/user.routes');
const bookRoutes = require('./routes/book.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const reviewRoutes = require('./routes/review.routes');
const paymentRoutes = require('./routes/payment.routes');
const statRoutes = require('./routes/stat.routes');

const app = express();
app.set('trust proxy', 1);

connectDB();

const clientOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || clientOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // allow deployed frontends; tighten later if needed
      }
    },
    credentials: true,
  })
);

// Better Auth MUST be mounted before express.json()
const { toNodeHandler } = require('better-auth/node');
const { auth } = require('./config/auth');

const authHandler = toNodeHandler(auth);
// Express 5-safe catch-all (string wildcards can 404 with better-auth)
app.all(/^\/api\/auth(\/.*)?$/, authHandler);

app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'BiblioDrop API',
    health: '/api/health',
    docs: {
      books: '/api/books',
      auth: '/api/auth/*',
    },
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
