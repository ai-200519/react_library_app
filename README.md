# Personal Library Management App

A modern web application for managing your personal book collection, built with React and Node.js.

## Features

- 📚 **Library Management**
  - Add, edit, and organize your books
  - Track reading status
  - Add books to shelves
  - Tag and categorize books
  - View book details

- 🔖 **Bookmarks**
  - Save and manage your favorite books
  - Quick access to frequently read books

- 📱 **Responsive Design**
  - Mobile-friendly interface
  - Smooth navigation experience
  - Modern UI components using Radix UI

- 📖 **Book Details**
  - Comprehensive book information
  - Lending and borrowing tracking
  - Reading progress tracking

## Tech Stack

### Frontend
- React (v19)
- Vite
- TailwindCSS
- Radix UI Components
- Lucide React Icons
- Sonner (for notifications)

### Backend
- Node.js
- Express
- PostgreSQL
- Docker (for database)

## Getting Started

### Prerequisites
- Node.js (Latest LTS version)
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ai-200519/react_library_app.git
   cd app-library-teet
   ```

2. **Frontend Setup**
   ```bash
   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```
   The frontend will be available at http://localhost:5173

3. **Backend Setup**
   ```bash
   cd server

   # Install dependencies
   npm install

   # Start PostgreSQL database
   npm run docker:up

   # Initialize database
   npm run db:init

   # Start backend server
   npm run dev
   ```

## Project Structure

```
├── src/                  # Frontend source code
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   └── ...          # Feature-specific components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── services/        # API services
│   └── assets/          # Static assets
│
├── server/              # Backend source code
│   ├── routes/         # API routes
│   ├── models/         # Database models
│   ├── db/            # Database scripts
│   └── ...
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop PostgreSQL container
- `npm run db:init` - Initialize database
- `npm run db:reset` - Reset database

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
