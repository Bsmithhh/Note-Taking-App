# Bear Notes - Full Stack Note-Taking Application

A modern, full-stack note-taking application built with React frontend and Node.js backend, featuring advanced search, categories, export/import, backup, and statistics.

## 🚀 Features

### Core Functionality
- **Note Management**: Create, edit, delete, and organize notes
- **Categories**: Color-coded categories with icons
- **Advanced Search**: Full-text search with relevance scoring
- **Search History**: Track and reuse recent searches
- **Export/Import**: Multiple formats (JSON, Markdown, PDF)
- **Backup & Restore**: Automatic backups with history
- **Statistics Dashboard**: Analytics and insights

### Technical Features
- **React Frontend**: Modern UI with component-based architecture
- **Node.js Backend**: RESTful API with Express.js
- **MongoDB Database**: Scalable NoSQL database
- **JWT Authentication**: Secure user authentication
- **Real-time Updates**: Live search and filtering
- **Responsive Design**: Mobile-friendly interface
- **Comprehensive Testing**: 137+ unit tests

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Webpack** - Module bundler
- **CSS3** - Styling with modern features
- **LocalStorage** - Client-side data persistence

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object Data Modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware

### Development Tools
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Babel** - JavaScript compiler
- **Nodemon** - Development server

## 📁 Project Structure

```
BrandenNotes/
├── src/                          # React frontend
│   ├── components/               # React components
│   │   ├── App.jsx              # Main app component
│   │   ├── Sidebar.jsx          # Category sidebar
│   │   ├── NotesList.jsx        # Notes list view
│   │   ├── NoteEditor.jsx       # Note editing interface
│   │   ├── SearchBar.jsx        # Search functionality
│   │   ├── Modal.jsx            # Reusable modal component
│   │   └── ...                  # Other components
│   ├── services/                # API service layer
│   │   ├── noteService.js       # Note operations
│   │   ├── categoryService.js   # Category operations
│   │   └── searchService.js     # Search operations
│   └── index.jsx                # React entry point
├── js/                          # Legacy vanilla JS modules
│   ├── app.js                   # Main application logic
│   ├── note.js                  # Note management
│   ├── category.js              # Category management
│   ├── search.js                # Search functionality
│   └── export.js                # Export/import features
├── backend/                     # Node.js backend
│   ├── src/
│   │   ├── models/              # MongoDB models
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Express middleware
│   │   ├── config/              # Configuration
│   │   └── server.js            # Express server
│   └── package.json
├── js/__tests__/                # Test files
├── dist/                        # Built files
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB (local or Atlas)
- npm or yarn

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your configuration
# Set MONGODB_URI and JWT_SECRET

# Start development server
npm run dev
```

### Database Setup
1. **Local MongoDB**:
   ```bash
   # Install MongoDB locally
   brew install mongodb-community  # macOS
   # or download from mongodb.com
   
   # Start MongoDB
   mongod
   ```

2. **MongoDB Atlas** (Recommended):
   - Create free account at [mongodb.com](https://mongodb.com)
   - Create cluster and get connection string
   - Update `MONGODB_URI` in backend `.env`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile

### Notes Endpoints
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Categories Endpoints
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Search Endpoints
- `GET /api/search` - Search notes
- `GET /api/search/suggestions` - Get suggestions

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- search.test.js
```

**Test Coverage**: 137+ tests covering:
- Note operations
- Category management
- Search functionality
- Export/import features
- Backup and statistics

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=production

# Deploy to Heroku
heroku create
git push heroku main
```

### Database (MongoDB Atlas)
1. Create free cluster at [mongodb.com](https://mongodb.com)
2. Get connection string
3. Update backend environment variables

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:3001/api
```

**Backend (.env)**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/bearnotes
JWT_SECRET=your-super-secret-key
FRONTEND_URL=http://localhost:3000
```

## 📊 Features in Detail

### Search System
- **Full-text search** across titles and content
- **Relevance scoring** based on word matches
- **Search history** with keyboard navigation
- **Real-time suggestions** from existing content
- **Advanced filters** by category, date, tags

### Export/Import
- **JSON export** for data portability
- **Markdown export** for documentation
- **PDF export** for sharing
- **Import validation** with duplicate handling
- **Batch operations** for multiple files

### Backup System
- **Automatic backups** with configurable frequency
- **Backup history** with timestamps
- **Export backups** for external storage
- **Restore functionality** with validation
- **Cleanup old backups** to save space

### Statistics Dashboard
- **Note analytics** (count, word count, trends)
- **Category usage** statistics
- **Activity reports** with date ranges
- **Visual charts** and graphs
- **Export reports** in multiple formats

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bear Notes** - Inspiration for the UI/UX design
- **React Team** - Amazing frontend framework
- **Express.js Team** - Robust backend framework
- **MongoDB Team** - Powerful NoSQL database

## 📞 Support

For support, email support@bearnotes.com or create an issue in this repository.

---

**Built with ❤️ for Northeastern University students** 