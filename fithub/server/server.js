require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('👉 Please check if your IP address is whitelisted in MongoDB Atlas (Network Access).');
  });

// Routes
app.get('/', (req, res) => {
  res.send('FitHub API is running...');
});

// Import Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/plans', require('./routes/plans'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
