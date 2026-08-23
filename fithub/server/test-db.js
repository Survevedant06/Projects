require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing connection to:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: Could not connect to MongoDB');
    console.error(err);
    process.exit(1);
  });

// Set a timeout to exit if it hangs
setTimeout(() => {
  console.error('TIMEOUT: Connection took too long');
  process.exit(1);
}, 15000);
