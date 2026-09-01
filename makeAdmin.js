require('dotenv').config();
const { MongoClient } = require('mongodb');

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email address. Example: node makeAdmin.js your@email.com');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    // Better Auth stores users in the "user" collection by default
    const result = await db.collection('user').updateOne(
      { email: email },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.log(`No user found with email: ${email}`);
    } else {
      console.log(`Successfully upgraded ${email} to admin!`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

makeAdmin();
