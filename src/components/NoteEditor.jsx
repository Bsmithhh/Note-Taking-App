import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import './NoteEditor.css';

const NoteEditor = ({ note, categories, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Color,
      TextStyle,
      Highlight,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setIsEditing(true);
    },
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setCategory(note.category || '');
      setIsEditing(false);
      
      if (editor) {
        // Convert plain text to HTML if needed
        const content = note.content || '';
        if (content && !content.includes('<')) {
          // Plain text - convert to HTML
          editor.commands.setContent(content.replace(/\n/g, '<br>'));
        } else {
          // Already HTML
          editor.commands.setContent(content);
        }
      }
    }
  }, [note, editor]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title for your note');
      return;
    }

    const noteData = {
      id: note?.id,
      title: title.trim(),
      content: editor?.getHTML() || '',
      category: category,
      lastModified: new Date().toISOString()
    };

    onSave(noteData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (note && confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  const getWordCount = () => {
    if (!editor) return 0;
    const textContent = editor.getText();
    return textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMinutes = Math.floor((now - then) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (!note) {
    return (
      <div className="note-content">
        <div className="empty-state">
          <h2>Welcome to Bear Notes</h2>
          <p>Select a note from the sidebar or create a new one to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="note-content">
      <div className="note-header">
        <input
          type="text"
          className="note-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          onFocus={() => setIsEditing(true)}
        />
        
        <div className="note-meta">
          {category && (
            <div className="note-category">
              <span 
                className="category-tag" 
                style={{ 
                  backgroundColor: categories.find(c => c.name === category)?.color || '#007bff' 
                }}
              >
                {category}
              </span>
            </div>
          )}
          <span className="note-date">
            {getTimeAgo(note.lastModified || note.timestamp)}
          </span>
        </div>
      </div>

      <div className="note-actions">
        <button 
          className="note-action-btn save-btn"
          onClick={handleSave}
        >
          💾 Save
        </button>
        <button 
          className="note-action-btn delete-btn"
          onClick={handleDelete}
        >
          🗑️ Delete
        </button>
      </div>

      {editor && (
        <div className="editor-toolbar">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is-active' : ''}
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
          
          <div className="toolbar-divider"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
            title="Heading 3"
          >
            H3
          </button>
          
          <div className="toolbar-divider"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            title="Bullet List"
          >
            •
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
            title="Numbered List"
          >
            1.
          </button>
          
          <div className="toolbar-divider"></div>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
            title="Align Left"
          >
            ←
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
            title="Align Center"
          >
            ↔
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
            title="Align Right"
          >
            →
          </button>
          
          <div className="toolbar-divider"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive('highlight') ? 'is-active' : ''}
            title="Highlight"
          >
            🟡
          </button>
        </div>
      )}

      <div className="note-content-area">
        <div className="tiptap-editor-container">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="note-footer">
        <div className="word-count">
          {getWordCount()} words
        </div>
        <div className="last-modified">
          Last modified: {getTimeAgo(note.lastModified || note.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default NoteEditor; 