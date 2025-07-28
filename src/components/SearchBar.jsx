import React, { useState, useEffect, useRef } from 'react';
import { getSearchHistory, saveSearchHistory, clearSearchHistory } from '../services/searchService';
import './SearchBar.css';

const SearchBar = ({ onSearch, searchQuery, isSearching }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const historyRef = useRef(null);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSearchHistory = () => {
    const history = getSearchHistory(10);
    setSearchHistory(history);
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    onSearch(query);
    setShowHistory(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedHistoryIndex(prev => 
        prev < searchHistory.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedHistoryIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedHistoryIndex >= 0 && searchHistory[selectedHistoryIndex]) {
        const selectedQuery = searchHistory[selectedHistoryIndex].query;
        searchInputRef.current.value = selectedQuery;
        onSearch(selectedQuery);
        saveSearchHistory(selectedQuery);
        setShowHistory(false);
        setSelectedHistoryIndex(-1);
      } else {
        const currentQuery = searchInputRef.current.value;
        if (currentQuery.trim()) {
          onSearch(currentQuery);
          saveSearchHistory(currentQuery);
          loadSearchHistory();
        }
        setShowHistory(false);
      }
    } else if (e.key === 'Escape') {
      setShowHistory(false);
      setSelectedHistoryIndex(-1);
    }
  };

  const handleHistoryItemClick = (historyItem) => {
    searchInputRef.current.value = historyItem.query;
    onSearch(historyItem.query);
    saveSearchHistory(historyItem.query);
    setShowHistory(false);
    setSelectedHistoryIndex(-1);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
  };

  const formatHistoryTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="search-container">
      <span className="search-icon">🔍</span>
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search notes..."
        className="search-input"
        defaultValue={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowHistory(true)}
      />
      
      {showHistory && searchHistory.length > 0 && (
        <div ref={historyRef} className="search-history-dropdown show">
          <div className="search-history-header">
            <h4>Recent Searches</h4>
            <button 
              className="clear-history-btn"
              onClick={handleClearHistory}
            >
              Clear All
            </button>
          </div>
          <div className="search-history-list">
            {searchHistory.map((historyItem, index) => (
              <div
                key={index}
                className={`search-history-item ${index === selectedHistoryIndex ? 'selected' : ''}`}
                onClick={() => handleHistoryItemClick(historyItem)}
              >
                <div className="search-history-query">{historyItem.query}</div>
                <div className="search-history-time">
                  {formatHistoryTime(historyItem.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isSearching && (
        <button 
          className="search-close-btn"
          onClick={() => {
            searchInputRef.current.value = '';
            onSearch('');
            setShowHistory(false);
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar; 