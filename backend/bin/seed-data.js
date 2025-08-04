const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../src/config/config');
const User = require('../src/models/user.model');
const Slot = require('../src/models/slot.model');
const Booking = require('../src/models/booking.model');

// Connect to MongoDB
mongoose.connect(config.mongoose.url, config.mongoose.options);

const password = 'password123';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

// Test users
const testUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: hashedPassword,
    role: 'user',
    isEmailVerified: true,
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: hashedPassword,
    role: 'user',
    isEmailVerified: true,
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
    isEmailVerified: true,
  },
];

// Test slots
const createTestSlots = () => {
  const slots = [];
  const today = new Date();
  
  // Create slots for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Create 3 slots per day
    for (let j = 0; j < 3; j++) {
      const startHour = 9 + (j * 2); // 9 AM, 11 AM, 1 PM
      const startTime = `${startHour.toString().padStart(2, '0')}:00`;
      const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;
      
      slots.push({
        date: date.toISOString().split('T')[0],
        startTime,
        endTime,
        maxBookings: 5,
        currentBookings: Math.floor(Math.random() * 3), // Random number of current bookings
        isActive: true,
      });
    }
  }
  
  return slots;
};

// Test bookings
const createTestBookings = (users, slots) => {
  const bookings = [];
  const reasons = [
    'General consultation',
    'Follow-up appointment',
    'Emergency visit',
    'Routine checkup',
    'Specialist consultation',
  ];
  
  const statuses = ['confirmed', 'completed', 'cancelled'];
  
  // Create some bookings
  for (let i = 0; i < 15; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const slot = slots[Math.floor(Math.random() * slots.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    bookings.push({
      slot: slot._id,
      user: user._id,
      reasonForVisit: reasons[Math.floor(Math.random() * reasons.length)],
      contactNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      additionalNotes: Math.random() > 0.7 ? 'Patient requested specific time slot' : null,
      status,
      cancelledAt: status === 'cancelled' ? new Date() : null,
      completedAt: status === 'completed' ? new Date() : null,
    });
  }
  
  return bookings;
};

const seedData = async () => {
  try {
    console.log('Starting data seeding...');
    
    // Clear existing data
    await User.deleteMany({});
    await Slot.deleteMany({});
    await Booking.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users
    const createdUsers = await User.insertMany(testUsers);
    console.log(`Created ${createdUsers.length} users`);
    
    // Create slots
    const testSlots = createTestSlots();
    const createdSlots = await Slot.insertMany(testSlots);
    console.log(`Created ${createdSlots.length} slots`);
    
    // Create bookings
    const testBookings = createTestBookings(createdUsers, createdSlots);
    const createdBookings = await Booking.insertMany(testBookings);
    console.log(`Created ${createdBookings.length} bookings`);
    
    console.log('Data seeding completed successfully!');
    console.log('\nTest accounts:');
    console.log('Admin: admin@example.com / password123');
    console.log('User 1: john.doe@example.com / password123');
    console.log('User 2: jane.smith@example.com / password123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeding
seedData(); 