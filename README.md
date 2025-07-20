# BrandenNotes - A Bear Notes Clone

A modern, responsive note-taking application built with vanilla JavaScript, inspired by Bear Notes. Features a clean interface, category organization, and powerful search capabilities.

## 🚀 Features

### Core Functionality
- **Note Creation & Editing**: Create, edit, and delete notes with real-time saving
- **Category Management**: Organize notes with custom categories, colors, and icons
- **Search & Filter**: Search through notes by title and content, filter by categories
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Storage**: All data is stored locally in your browser

### Organization Features
- **Smart Categories**: Pre-built categories (All, Untagged, Todo, Today, Locked, Archive, Trash)
- **Custom Categories**: Create your own categories with custom colors and emoji icons
- **Note Counts**: See how many notes are in each category
- **Timestamps**: Track when notes were created and last modified

### User Experience
- **Clean Interface**: Minimalist design focused on content
- **Mobile-First**: Responsive sidebar that adapts to mobile screens
- **Keyboard Shortcuts**: Efficient note-taking workflow
- **Auto-Save**: Changes are saved automatically as you type

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Build Tool**: Webpack 5
- **Styling**: CSS3 with modern layout techniques
- **Testing**: Jest for unit testing
- **Storage**: Browser localStorage
- **Development**: Babel for ES6+ transpilation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BrandenNotes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` (or the port shown in your terminal)

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

The app includes comprehensive tests for:
- Note creation, editing, and deletion
- Category management
- Search functionality
- Data persistence

## 📁 Project Structure

```
BrandenNotes/
├── js/                    # JavaScript modules
│   ├── app.js            # Main application controller
│   ├── note.js           # Note management functions
│   ├── category.js       # Category management functions
│   ├── search.js         # Search functionality
│   └── __tests__/        # Test files
├── public/               # Static assets
├── index.html            # Main HTML file
├── styles.css            # Main stylesheet
├── webpack.config.js     # Webpack configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run test suite

## 💾 Data Storage

All notes and categories are stored in your browser's localStorage. This means:
- ✅ No account required
- ✅ Works offline
- ✅ Data stays on your device
- ⚠️ Data is tied to your browser/device
- ⚠️ Clearing browser data will remove your notes

## 🎨 Customization

### Adding Custom Categories
1. Click the "Create Category" button in the sidebar
2. Enter a category name
3. Choose a color and emoji icon
4. Click "Create Category"

### Styling
The app uses CSS custom properties for easy theming. Key variables are defined in `styles.css`:
- `--primary-color`: Main accent color
- `--background-color`: App background
- `--text-color`: Primary text color
- `--sidebar-width`: Sidebar width

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by [Bear Notes](https://bear.app/)
- Built with modern web technologies
- Designed for simplicity and productivity

## 🐛 Known Issues

- Notes are stored locally only (no cloud sync)
- No rich text formatting yet (planned for future versions)
- No export/import functionality (planned for future versions)

## 🔮 Future Features

### **Phase 1: Advanced Search (In Progress)**
- [ ] Full-text search with relevance scoring
- [ ] Search by date ranges and categories
- [ ] Search history and saved searches
- [ ] Keyboard shortcuts (Ctrl+K for quick search)
- [ ] Search term highlighting in results

### **Phase 2: Rich Text Editing & Markdown**
- [ ] Markdown preview mode
- [ ] Basic formatting toolbar (bold, italic, lists, links)
- [ ] Code syntax highlighting
- [ ] Image paste/upload functionality
- [ ] HTML to Markdown conversion

### **Phase 3: Data Export & Backup**
- [ ] Export notes to PDF, Markdown, or JSON
- [ ] Automatic backup to local storage
- [ ] Import functionality for migration
- [ ] Data statistics (word counts, note trends)
- [ ] Activity reports and analytics

### **Additional Features**
- [ ] Cloud synchronization
- [ ] Tags system
- [ ] Note templates
- [ ] Dark mode
- [ ] Note sharing
- [ ] Mobile app

---

**Happy Note-Taking! 📝** 