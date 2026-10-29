const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const realEvents = [
  {
    title: "Google Cloud & Generative AI Summit 2026",
    description: "Deep dive into Gemini API, vector embeddings, fine-tuning LLMs, and deploying scalable architectures with cloud engineers.",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    venue: "Bengaluru Tech Park / Google Meet",
    capacity: 100,
    attendeeCount: 88,
    status: "published"
  },
  {
    title: "Full-Stack Web3 & Microservices Hackathon",
    description: "48-hour challenge building high-throughput microservices using Docker, Kafka, Redis, and React. Cash prizes worth ₹1,00,000.",
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    venue: "DLF CyberCity, Gurugram (In-Person)",
    capacity: 60,
    attendeeCount: 57,
    status: "published"
  },
  {
    title: "Next.js & React 19 Performance Masterclass",
    description: "Hands-on deep dive into React Server Components, server actions, bundle splitting, and zero-runtime CSS optimization.",
    date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    venue: "Virtual Live Stream (YouTube Private)",
    capacity: 250,
    attendeeCount: 210,
    status: "published"
  },
  {
    title: "Open Source AI & Rust Systems Meetup",
    description: "Networking session for systems engineers and open-source contributors working on LLM inference engines in Rust and C++.",
    date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    venue: "T-Hub, Hyderabad",
    capacity: 80,
    attendeeCount: 45,
    status: "published"
  }
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    let organizer = await User.findOne({ email: "admin@eventhub.com" });
    if (!organizer) {
      const hashedPassword = await bcrypt.hash("Admin@1234", 10);
      organizer = await User.create({
        name: "DevCommunity Global",
        email: "admin@eventhub.com",
        password: hashedPassword,
        role: "organizer"
      });
    }

    await Event.deleteMany({});
    const eventsWithOrganizer = realEvents.map(evt => ({ ...evt, organizer: organizer._id }));
    await Event.insertMany(eventsWithOrganizer);

    console.log("Realistic seed events injected successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedData();