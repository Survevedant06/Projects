require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('./models/Plan');
const Workout = require('./models/Workout');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');

  // Clear existing
  await Plan.deleteMany({});
  await Workout.deleteMany({});

  const basic = await new Plan({ name: 'Basic', description: 'Perfect for beginners starting their fitness journey.' }).save();
  const intermediate = await new Plan({ name: 'Intermediate', description: 'For people with some fitness experience.' }).save();
  const advanced = await new Plan({ name: 'Advanced', description: 'High intensity workouts for advanced athletes.' }).save();

  const plans = [basic, intermediate, advanced];

  for (const plan of plans) {
    for (let day = 1; day <= 7; day++) {
       // Seed some exercises for each day
       const exercises = [
         { workoutName: 'Pushups', sets: 3, reps: 15, workoutLink: 'https://www.youtube.com/results?search_query=pushups+tutorial' },
         { workoutName: 'Squats', sets: 3, reps: 20, workoutLink: 'https://www.youtube.com/results?search_query=squats+tutorial' },
         { workoutName: 'Plank', sets: 3, reps: 1, workoutLink: 'https://www.youtube.com/results?search_query=plank+tutorial' }
       ];

       for (const ex of exercises) {
         await new Workout({
           plan: plan._id,
           dayNumber: day,
           ...ex
         }).save();
       }
    }
  }

  console.log('Seeding complete!');
  process.exit();
};

seed();
