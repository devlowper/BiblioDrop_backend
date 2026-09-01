const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("@better-auth/mongo-adapter");
const { dash } = require("@better-auth/infra");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

const auth = betterAuth({
  plugins: [dash()],
  trustedOrigins: [process.env.CLIENT_ORIGIN || "http://localhost:5173", "http://localhost:3000"],
  database: mongodbAdapter(client.db()),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    },
  },
});

module.exports = { auth };
