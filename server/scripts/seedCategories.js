const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
  {
    name: 'General Discussion',
    description: 'General topics and discussions about anything and everything',
    slug: 'general-discussion',
    icon: '💬',
    order: 1
  },
  {
    name: 'Technology',
    description: 'Discussions about programming, software, hardware, and tech news',
    slug: 'technology',
    icon: '💻',
    order: 2
  },
  {
    name: 'Gaming',
    description: 'Video games, gaming news, and gaming communities',
    slug: 'gaming',
    icon: '🎮',
    order: 3
  },
  {
    name: 'Movies & TV Shows',
    description: 'Discuss your favorite movies, TV shows, and entertainment',
    slug: 'movies-tv',
    icon: '🎬',
    order: 4
  },
  {
    name: 'Music',
    description: 'Share and discuss music, artists, and concerts',
    slug: 'music',
    icon: '🎵',
    order: 5
  },
  {
    name: 'Sports',
    description: 'Sports news, events, and discussions',
    slug: 'sports',
    icon: '⚽',
    order: 6
  },
  {
    name: 'Art & Creative',
    description: 'Share your artwork, photography, and creative projects',
    slug: 'art-creative',
    icon: '🎨',
    order: 7
  },
  {
    name: 'Help & Support',
    description: 'Get help from the community or provide assistance to others',
    slug: 'help-support',
    icon: '🆘',
    order: 8
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const result = await Category.insertMany(categories);
    console.log(`Added ${result.length} categories`);

    console.log('Categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
