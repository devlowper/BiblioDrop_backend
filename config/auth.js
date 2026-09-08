const { betterAuth } = require('better-auth');
const { mongodbAdapter } = require('@better-auth/mongo-adapter');
const { dash } = require('@better-auth/infra');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

client.connect().catch((err) => {
  console.error('MongoClient (better-auth) connect error:', err.message);
});

/**
 * better-auth expects:
 *   baseURL  = origin only (e.g. https://api.example.com)
 *   basePath = /api/auth  (default)
 * Env may be either the origin or full ".../api/auth" URL.
 */
function resolveAuthUrl(raw) {
  const fallback = 'http://localhost:5000';
  try {
    const u = new URL(raw || fallback);
    const path = u.pathname.replace(/\/$/, '');
    if (!path || path === '/') {
      return { baseURL: u.origin, basePath: '/api/auth' };
    }
    return { baseURL: u.origin, basePath: path };
  } catch {
    return { baseURL: fallback, basePath: '/api/auth' };
  }
}

const { baseURL, basePath } = resolveAuthUrl(
  process.env.BETTER_AUTH_URL || process.env.BETTER_AUTH_BASE_URL
);

const auth = betterAuth({
  baseURL,
  basePath,
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [dash()],
  trustedOrigins: [
    process.env.CLIENT_ORIGIN,
    'http://localhost:5173',
    'http://localhost:3000',
    'https://bibliodrop.vercel.app',
    'https://online-book-delivery.vercel.app',
  ].filter(Boolean),
  database: mongodbAdapter(client.db()),
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
});

module.exports = { auth, baseURL, basePath };
