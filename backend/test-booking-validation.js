const mongoose = require('mongoose');
const Slot = require('./src/models/slot.model');
const Booking = require('./src/models/booking.model');

// Connect to test database
mongoose.connect('mongodb://localhost:27017/appointment-booking-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testBookingValidation() {
  try {
    console.log('Testing booking validation...');
    
    // Create a test slot for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10:00 AM
    
    const slot = new Slot({
      date: tomorrow,
      startTime: '10:00',
      endTime: '10:30',
      maxBookings: 1,
      currentBookings: 0,
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(),
    });
    
    await slot.save();
    console.log('Created test slot:', slot._id);
    
    // Test 1: Check if slot can accept booking
    console.log('\nTest 1: Can slot accept booking?');
    console.log('canAcceptBooking():', slot.canAcceptBooking());
    console.log('isAvailable:', slot.isAvailable);
    
    // Test 2: Create a booking
    console.log('\nTest 2: Creating a booking...');
    const booking = new Booking({
      slot: slot._id,
      user: new mongoose.Types.ObjectId(),
      reasonForVisit: 'Test appointment',
      contactNumber: '+1234567890',
      status: 'confirmed',
    });
    
    await booking.save();
    console.log('Booking created successfully');
    
    // Test 3: Check slot after booking
    console.log('\nTest 3: Slot status after booking...');
    await slot.refresh();
    console.log('currentBookings:', slot.currentBookings);
    console.log('canAcceptBooking():', slot.canAcceptBooking());
    console.log('isAvailable:', slot.isAvailable);
    
    // Test 4: Try to create another booking for the same slot
    console.log('\nTest 4: Trying to create another booking for the same slot...');
    const booking2 = new Booking({
      slot: slot._id,
      user: new mongoose.Types.ObjectId(),
      reasonForVisit: 'Test appointment 2',
      contactNumber: '+1234567891',
      status: 'confirmed',
    });
    
    try {
      await booking2.save();
      console.log('ERROR: Second booking was created when it should have failed');
    } catch (error) {
      console.log('SUCCESS: Second booking correctly rejected:', error.message);
    }
    
    // Test 5: Check available slots
    console.log('\nTest 5: Checking available slots...');
    const availableSlots = await Slot.findAvailable();
    console.log('Available slots count:', availableSlots.length);
    console.log('Available slots:', availableSlots.map(s => ({ id: s._id, date: s.date, startTime: s.startTime, currentBookings: s.currentBookings })));
    
    // Test 6: Test past slot validation
    console.log('\nTest 6: Testing past slot validation...');
    const pastSlot = new Slot({
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      startTime: '10:00',
      endTime: '10:30',
      maxBookings: 1,
      currentBookings: 0,
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(),
    });
    
    await pastSlot.save();
    console.log('Past slot canAcceptBooking():', pastSlot.canAcceptBooking());
    console.log('Past slot isAvailable:', pastSlot.isAvailable);
    
    // Cleanup
    console.log('\nCleaning up...');
    await Slot.deleteMany({});
    await Booking.deleteMany({});
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testBookingValidation(); 