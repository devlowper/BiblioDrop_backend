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
 * BETTER_AUTH_URL must be YOUR backend origin (Render URL), e.g.
 *   https://bibliodrop-backend-y734.onrender.com
 * or
 *   https://bibliodrop-backend-y734.onrender.com/api/auth
 *
 * NEVER use https://kv.better-auth.com/... (that is the dashboard/infra URL).
 */
function resolveAuthUrl() {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.RENDER_EXTERNAL_URL;

  const candidates = [
    process.env.BETTER_AUTH_URL,
    process.env.RENDER_EXTERNAL_URL,
    process.env.BETTER_AUTH_BASE_URL,
    'http://localhost:5000',
  ].filter(Boolean);

  for (const raw of candidates) {
    try {
      const u = new URL(raw);
      // Ignore Better Auth cloud/dashboard hosts — they break local route matching
      if (u.hostname.includes('better-auth.com') || u.hostname.includes('kv.better-auth')) {
        console.warn(
          `[auth] Ignoring invalid BETTER_AUTH_URL (${raw}). Use your Render backend URL instead.`
        );
        continue;
      }

      // In production/Render, skip localhost URLs so fallback works
      if (isProd && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
        continue;
      }

      const path = u.pathname.replace(/\/$/, '');
      // Always serve auth under /api/auth on this Express app
      return {
        baseURL: u.origin,
        basePath: '/api/auth',
        raw,
      };
    } catch {
      /* try next */
    }
  }

  return { baseURL: 'http://localhost:5000', basePath: '/api/auth', raw: null };
}

const { baseURL, basePath } = resolveAuthUrl();
console.log(`[auth] better-auth baseURL=${baseURL} basePath=${basePath}`);

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER_EXTERNAL_URL;

const auth = betterAuth({
  baseURL,
  basePath,
  secret: process.env.BETTER_AUTH_SECRET || 'ba_v65ljyniq46bpy6921kqjy6sokx8200j',
  plugins: process.env.BETTER_AUTH_API_KEY ? [dash()] : [],
  trustedOrigins: [
    process.env.CLIENT_ORIGIN,
    'http://localhost:5173',
    'http://localhost:3000',
    'https://bibliodrop.netlify.app',
    'https://bibliodrop.vercel.app',
    'https://online-book-delivery.vercel.app',
    'https://bibliodrop-backend-y734.onrender.com',
  ].filter(Boolean),
  advanced: {
    useSecureCookies: isProduction,
    disableCSRFCheck: true,
    defaultCookieAttributes: {
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction ? true : false,
    },
  },
  onAPIError: {
    errorURL: process.env.CLIENT_ORIGIN ? `${process.env.CLIENT_ORIGIN}/login` : 'https://bibliodrop.netlify.app/login',
  },
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
    },
  },
});

module.exports = { auth, baseURL, basePath };
