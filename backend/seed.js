const mongoose = require('mongoose');
require('dotenv').config();
const Counsellor = require('./models/Counsellor');
const User = require('./models/User');

const users = [
  { name: "Current Student", email: "student@unicare.edu", role: "student" },
  { name: "Dr. Sarah Jenkins", email: "sarah@unicare.edu", role: "counsellor" }
];

const counsellors = [
  {
    name: "Dr. Silva",
    email: "silva@unicare.edu",
    specialization: "Anxiety Specialist",
    experience: "12 years",
    bio: "Expert in anxiety and cognitive behavioral therapy.",
    image: "https://images.unsplash.com/photo-1559839734-2b71f1536750?q=80&w=600&auto=format&fit=crop",
    price: 3500,
    availability: [
      { 
        date: new Date().toISOString().split('T')[0], 
        slots: ["09:00", "11:00", "13:00", "15:00"] 
      },
      { 
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], 
        slots: ["09:00", "11:00", "13:00", "15:00"] 
      }
    ]
  },
  {
    name: "Dr. Perera",
    email: "perera@unicare.edu",
    specialization: "Academic Stress Expert",
    experience: "8 years",
    bio: "Helping students overcome exam anxiety and academic pressure.",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=600&auto=format&fit=crop",
    price: 3000,
    availability: [
      { 
        date: new Date().toISOString().split('T')[0], 
        slots: ["09:00", "11:00", "13:00", "15:00"] 
      },
      { 
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], 
        slots: ["09:00", "11:00", "13:00", "15:00"] 
      }
    ]
  },
  {
    name: "Dr. Sarah Jenkins",
    email: "sarah@unicare.edu",
    specialization: "Relationship Counselor",
    experience: "15 years",
    bio: "Specialist in building health relationships and social well-being.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
    price: 4500,
    availability: [
      { 
        date: new Date().toISOString().split('T')[0], 
        slots: ["09:00", "11:00", "13:00", "15:00"] 
      }
    ]
  }
];

const seedDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("MONGO_URI not found in .env");
    
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");
    
    // ONLY delete counsellors to refresh them, but KEEP the users
    await Counsellor.deleteMany({});
    console.log("Refreshed counsellors list.");
    
    // Insert counsellors
    await Counsellor.insertMany(counsellors);
    console.log("Successfully seeded counsellors!");

    // Check if we need to add a default admin if none exists
    const userCount = await User.countDocuments();
    if (userCount === 0) {
        await User.insertMany(users);
        console.log("Seeded initial users as none were found.");
    } else {
        console.log(`Preserved ${userCount} existing users.`);
    }
    
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
};

seedDB();
