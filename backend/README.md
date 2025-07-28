# Bear Notes Backend API

A robust Node.js backend API for the Bear Notes application, built with Express.js and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration, login, and profile management
- **Note Management**: Full CRUD operations for notes with rich text support
- **Category Management**: Organize notes with customizable categories
- **Search & Filtering**: Advanced search capabilities with pagination
- **Statistics & Analytics**: Comprehensive user and note statistics
- **Admin Panel**: User management and system-wide statistics
- **Security**: Rate limiting, input validation, and security headers
- **File Upload**: Support for note attachments
- **Import/Export**: Data portability features

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/bear-notes
   # For MongoDB Atlas: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bear-notes

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Security
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   ```

4. **Start the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🗄️ Database Setup

### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Create database: `bear-notes`

### MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Notes
- `GET /api/notes` - Get all notes (with pagination & filters)
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PATCH /api/notes/:id/pin` - Toggle pin status
- `PATCH /api/notes/:id/archive` - Toggle archive status
- `PATCH /api/notes/:id/public` - Toggle public status
- `POST /api/notes/:id/duplicate` - Duplicate note
- `GET /api/notes/search/:query` - Search notes
- `GET /api/notes/stats/overview` - Get note statistics
- `POST /api/notes/bulk-delete` - Bulk delete notes
- `POST /api/notes/bulk-move` - Bulk move notes
- `POST /api/notes/import` - Import notes
- `GET /api/notes/export` - Export notes

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/stats/overview` - Get category statistics
- `POST /api/categories/reorder` - Reorder categories
- `POST /api/categories/:id/merge` - Merge category

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats/overview` - Get user statistics
- `POST /api/users/:id/activate` - Activate user
- `POST /api/users/:id/deactivate` - Deactivate user

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 Data Models

### User
- `username` (unique)
- `email` (unique)
- `password` (hashed)
- `firstName`, `lastName`
- `avatar`
- `isActive`
- `preferences` (theme, language, notifications)
- `lastLogin`

### Note
- `userId` (reference to User)
- `title`
- `content` (rich text)
- `category` (reference to Category)
- `tags`
- `isPinned`, `isArchived`, `isPublic`
- `priority` (low, medium, high)
- `color`
- `attachments`
- `metadata` (word count, character count, reading time)
- `version`
- `history` (edit history)

### Category
- `userId` (reference to User)
- `name` (unique per user)
- `description`
- `color`
- `icon`
- `isDefault`, `isActive`
- `parentCategory` (for nested categories)
- `order`
- `metadata` (note count, last used)

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Configurable rate limiting per IP
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Protection**: MongoDB with parameterized queries
- **XSS Protection**: Input sanitization and validation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/bear-notes |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `MAX_FILE_SIZE` | Max file upload size | 10485760 (10MB) |
| `UPLOAD_PATH` | File upload directory | ./uploads |

## 🚀 Deployment

### Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy with Git

### Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Vercel
1. Import project
2. Set environment variables
3. Deploy

## 📈 Monitoring

- **Health Check**: `GET /health`
- **Request Logging**: Morgan HTTP logger
- **Error Handling**: Comprehensive error handling with logging
- **Performance**: Optimized database queries with indexes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team. 