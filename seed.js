const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./config/db');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    
    if (adminExists) {
      console.log('Admin already exists. Updating password and role to ensure access...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      adminExists.password = hashedPassword;
      adminExists.role = 'admin';
      await adminExists.save();
      console.log('Admin credentials updated successfully.');
    } else {
      console.log('Creating new admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      
      const admin = new User({
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
      });
      
      await admin.save();
      console.log('Admin user created successfully.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
