# Advanced Forum Website

A modern, full-stack forum application built with React, Node.js, Express, and MongoDB. This project features a beautiful cyberpunk-inspired UI, real-time updates, and comprehensive user management.

## 🌟 Features

- **User Authentication**
  - JWT-based authentication
  - Secure password hashing
  - Role-based access control

- **Forum Functionality**
  - Create and manage categories
  - Create, edit, and delete posts
  - Comment system with threading
  - Rich text editor support
  - Real-time updates

- **Modern UI/UX**
  - Responsive design
  - Cyberpunk-inspired theme
  - Smooth animations
  - Dark mode support

- **Advanced Features**
  - Search functionality
  - User profiles
  - Activity tracking
  - Moderation tools

## 🚀 Tech Stack

### Frontend
- React.js
- Vite
- TailwindCSS
- React Router
- Axios
- React Query

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Cookie Parser
- CORS

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/Oxcanga/Mern-Forum.git
cd Mern-Forum
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables:

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Running the Application

### Development Mode

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend development server:
```bash
cd client
npm run dev
```

### Production Mode

1. Build the frontend:
```bash
cd client
npm run build
```

2. Start the production server:
```bash
cd server
npm start
```

## 🌐 Deployment

### Backend (Railway)
1. Create a Railway account
2. Install Railway CLI
3. Deploy using:
```bash
railway up
```

### Frontend (Vercel)
1. Create a Vercel account
2. Install Vercel CLI
3. Deploy using:
```bash
vercel
```

## 🔧 Environment Variables

### Backend
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `NODE_ENV`: Environment (development/production)
- `CLIENT_URL`: Frontend URL for CORS

### Frontend
- `VITE_API_URL`: Backend API URL

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Oxcanga - Initial work

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by modern forum platforms
- Built with ❤️ using the MERN stack
