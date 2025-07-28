# Bear Notes Backend API

A Node.js/Express backend API for the Bear Notes application with MongoDB database and JWT authentication.

## Features

- **User Authentication**: Register, login, profile management with JWT
- **Notes Management**: CRUD operations for notes with categories and tags
- **Categories**: Create, update, delete categories with color coding
- **Advanced Search**: Full-text search with relevance scoring
- **Statistics**: Note and category usage analytics
- **Security**: Password hashing, JWT tokens, input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, cors
- **Validation**: Mongoose schema validation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/logout` - Logout user

### Notes
- `GET /api/notes` - Get all notes (with pagination)
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/stats/overview` - Get note statistics
- `POST /api/notes/bulk` - Bulk operations

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/stats/usage` - Get category statistics
- `POST /api/categories/:id/merge` - Merge categories

### Search
- `GET /api/search` - Search notes
- `GET /api/search/suggestions` - Get search suggestions
- `GET /api/search/advanced` - Advanced search
- `GET /api/search/history` - Get search history
- `POST /api/search/history` - Save search to history
- `DELETE /api/search/history` - Clear search history

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud database)
   - Update `MONGODB_URI` in `.env`

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Production Build**
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/bearnotes` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## Database Models

### User
- Username, email, password
- Preferences (theme, language, auto-save)
- Account status and timestamps

### Note
- Title, content, category
- Tags, archive/lock status
- User association and timestamps
- Full-text search indexing

### Category
- Name, color, icon
- User association
- Note count tracking

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Mongoose schema validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Rate Limiting**: Built-in Express rate limiting

## Development

### Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Note.js
│   │   ├── Category.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── categories.js
│   │   └── search.js
│   └── server.js
├── package.json
└── README.md
```

### API Response Format

**Success Response:**
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Testing

Run tests (when implemented):
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 