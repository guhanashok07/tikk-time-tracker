import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Plus, Edit, X, ChevronDown, ChevronUp, Clock, Trash2, Save, XCircle, Pencil, Settings,
  Book, Briefcase, Heart, Home, Activity, Gamepad, Lightbulb, Pen, Laptop, BarChart,
  Phone, Mail, Calendar, Plane, Car, Utensils, ShoppingCart, Moon, PartyPopper, Music,
  Palette, Puzzle, FlaskConical, TrendingDown, MessageSquare, HelpCircle, CheckCircle,
  ChevronLeft, ChevronRight // Added for calendar navigation
} from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Map of icon names to Lucide React components for dynamic rendering
const ICON_NAME_TO_COMPONENT_MAP = {
  Book: Book,
  Briefcase: Briefcase,
  Settings: Settings,
  Heart: Heart,
  Home: Home,
  Activity: Activity,
  Gamepad: Gamepad,
  Lightbulb: Lightbulb,
  Pen: Pen,
  Laptop: Laptop,
  BarChart: BarChart,
  Phone: Phone,
  Mail: Mail,
  Calendar: Calendar,
  Plane: Plane,
  Car: Car,
  Utensils: Utensils,
  ShoppingCart: ShoppingCart,
  Moon: Moon,
  PartyPopper: PartyPopper,
  Music: Music,
  Palette: Palette,
  Puzzle: Puzzle,
  FlaskConical: FlaskConical,
  TrendingDown: TrendingDown,
  MessageSquare: MessageSquare,
  HelpCircle: HelpCircle,
  CheckCircle: CheckCircle,
  // Default/fallback icons
  Plus: Plus,
  Save: Save,
  XCircle: XCircle,
  Pencil: Pencil,
  Trash2: Trash2,
  Play: Play,
  Clock: Clock,
  ChevronDown: ChevronDown,
  ChevronUp: ChevronUp,
  ChevronLeft: ChevronLeft, // Added for calendar
  ChevronRight: ChevronRight // Added for calendar
};

// List of available icons for the picker (using icon names)
const AVAILABLE_ICONS = [
  { id: 'Book', component: Book },
  { id: 'Briefcase', component: Briefcase },
  { id: 'Settings', component: Settings },
  { id: 'Heart', component: Heart },
  { id: 'Home', component: Home },
  { id: 'Activity', component: Activity },
  { id: 'Gamepad', component: Gamepad },
  { id: 'Lightbulb', component: Lightbulb },
  { id: 'Pen', component: Pen },
  { id: 'Laptop', component: Laptop },
  { id: 'BarChart', component: BarChart },
  { id: 'Phone', component: Phone },
  { id: 'Mail', component: Mail },
  { id: 'Calendar', component: Calendar },
  { id: 'Plane', component: Plane },
  { id: 'Car', component: Car },
  { id: 'Utensils', component: Utensils },
  { id: 'ShoppingCart', component: ShoppingCart },
  { id: 'Moon', component: Moon },
  { id: 'PartyPopper', component: PartyPopper },
  { id: 'Music', component: Music },
  { id: 'Palette', component: Palette },
  { id: 'Puzzle', component: Puzzle },
  { id: 'FlaskConical', component: FlaskConical },
  { id: 'TrendingDown', component: TrendingDown },
  { id: 'MessageSquare', component: MessageSquare },
  { id: 'HelpCircle', component: HelpCircle },
  { id: 'CheckCircle', component: CheckCircle },
];


// --- App (Time Tracker) Component ---
const App = ({ logs, setLogs, categories, setCategories, onNavigate }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Book'); // Stores icon name
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null); // This is for logs, not categories
  const [editedDescription, setEditedDescription] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  // Removed showLogs state as per request to always show logs
  const [showIconPicker, setShowIconPicker] = useState(false); // Changed from showEmojiPicker
  const [isManagingCategories, setIsManagingCategories] = useState(false); // New state for category management mode
  const [editingCategoryId, setEditingCategoryId] = useState(null); // State for editing category
  const [tempCategoryName, setTempCategoryName] = useState('');
  const [tempCategoryIcon, setTempCategoryIcon] = useState(''); // Stores icon name

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Show 10 entries per page

  const intervalRef = useRef(null);
  const iconPickerRef = useRef(null); // Changed from emojiPickerRef

  const MAX_CATEGORIES = 10;

  // Close icon picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target)) {
        setShowIconPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Timer effect - now updates every 10 milliseconds for millisecond display
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, startTime]);

  // Function to format time from milliseconds to HH:MM:SS.MS
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor(ms % 1000).toString().padStart(3, '0').substring(0, 2);

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      milliseconds: milliseconds
    };
  };

  // Handles starting and stopping the timer
  const handleStartStop = (categoryToStart = null) => {
    if (isRunning) {
      const duration = elapsedTime;
      const newLog = {
        id: Date.now(),
        description: description || 'Untitled',
        category: selectedCategory || 'Uncategorized',
        duration: duration,
        timestamp: new Date().toISOString(),
        sessions: [{
          start: startTime,
          end: Date.now(),
          duration: duration
        }]
      };

      setLogs(prev => [newLog, ...prev]);
      setElapsedTime(0);
      setDescription(''); // Clear description for next session
      setSelectedCategory('');
      setIsRunning(false); // Stop the timer

      // If a new category was passed, start a new timer immediately
      if (categoryToStart) {
        setStartTime(Date.now());
        setSelectedCategory(categoryToStart);
        setIsRunning(true);
      }
    } else {
      const now = Date.now();
      setStartTime(now);
      setIsRunning(true);
      // If a category was clicked to start, ensure it's selected
      if (categoryToStart) {
        setSelectedCategory(categoryToStart);
      } else if (!selectedCategory) {
        // If no category selected and starting via description, default to Uncategorized
        setSelectedCategory('Uncategorized');
      }
    }
  };

  // Adds a new category to the list
  const addCategory = () => {
    if (newCategoryName.trim() && categories.length < MAX_CATEGORIES) {
      const newCategory = {
        id: Date.now(),
        name: newCategoryName.trim(),
        iconName: newCategoryIcon // Storing icon name
      };
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setNewCategoryIcon('Book'); // Reset to default icon name
      setShowAddCategory(false);
      setShowIconPicker(false);
    }
  };

  // Handles clicking on a category to select/deselect it or start/stop timer
  const handleCategoryClick = (categoryName) => {
    if (!isManagingCategories) { // Only allow selection/timer control if not in management mode
      if (isRunning) {
        if (selectedCategory === categoryName) {
          // If the same category is clicked, stop the timer
          handleStartStop();
        } else if (selectedCategory === 'Uncategorized') { // If timer is running with 'Uncategorized' category, just assign the clicked category
          setSelectedCategory(categoryName);
        }
        else {
          // If a different category is clicked, stop current and start new
          handleStartStop(categoryName);
        }
      } else {
        // If timer is not running, set category and start timer
        setSelectedCategory(categoryName);
        handleStartStop(categoryName);
      }
    }
  };

  // Deletes a log by its ID
  const handleDeleteLog = (logId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this session? This cannot be undone.");
    if (confirmDelete) {
      setLogs(prev => {
        const updatedLogs = prev.filter(log => log.id !== logId);
        // Adjust current page if the last item on the current page was deleted
        if (updatedLogs.length > 0 && currentPage > Math.ceil(updatedLogs.length / itemsPerPage)) {
          setCurrentPage(prevPage => prevPage - 1);
        } else if (updatedLogs.length === 0) {
          setCurrentPage(1); // Reset to page 1 if no logs left
        }
        return updatedLogs;
      });
    }
  };

  // Initiates editing for a specific log
  const handleEditLog = (log) => {
    setEditingLogId(log.id);
    setEditedDescription(log.description);
    setEditedCategory(log.category);
  };

  // Saves changes to an edited log
  const handleSaveEdit = (logId) => {
    setLogs(prev => prev.map(log =>
      log.id === logId ? { ...log, description: editedDescription, category: editedCategory } : log
    ));
    setEditingLogId(null);
  };

  // Cancels editing for a specific log
  const handleCancelEdit = () => {
    setEditingLogId(null);
  };

  // Handle Enter key press on description input
  const handleDescriptionKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleStartStop(); // Toggles timer regardless of current state
    }
  };

  // New function to resume tracking a previous session
  const handleResumeTracking = (log) => {
    // If a timer is currently running, stop it first and save the current session
    if (isRunning) {
      handleStartStop();
    }
    // Set the description and category to the selected log's values
    setDescription(log.description);
    setSelectedCategory(log.category);
    // Start a new timer
    setStartTime(Date.now());
    setElapsedTime(0); // Reset elapsed time for the new session
    setIsRunning(true);
  };


  // --- Category Management Functions ---
  const handleManageCategoriesToggle = () => {
    setIsManagingCategories(prev => {
      const newState = !prev;
      if (!newState) { // Exiting manage mode
        setShowAddCategory(false); // Hide add category form
        setEditingCategoryId(null); // Also exit editing any category
      }
      return newState;
    });
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setTempCategoryName(category.name);
    setTempCategoryIcon(category.iconName); // Set icon name for editing
    setShowIconPicker(false); // Ensure picker is closed initially
  };

  const handleSaveCategory = (id) => {
    if (tempCategoryName.trim()) {
      setCategories(prev => prev.map(cat =>
        cat.id === id ? { ...cat, name: tempCategoryName.trim(), iconName: tempCategoryIcon } : cat
      ));
      setEditingCategoryId(null);
      setTempCategoryName('');
      setTempCategoryIcon('');
    }
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setTempCategoryName('');
    setTempCategoryIcon('');
  };

  const handleDeleteCategory = (id) => {
    // Replaced window.confirm with a custom modal for better UX in a Canvas environment
    const confirmDelete = window.confirm("Are you sure you want to delete this category? This cannot be undone.");
    if (confirmDelete) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
      // If the deleted category was selected, deselect it
      if (selectedCategory === categories.find(cat => cat.id === id)?.name) {
        setSelectedCategory('');
      }
      setEditingCategoryId(null); // Exit edit mode if the deleted category was being edited
    }
  };

  const isAddCategoryDisabled = categories.length >= MAX_CATEGORIES;

  // Calculate logs for the current page
  const indexOfLastLog = currentPage * itemsPerPage;
  const indexOfFirstLog = indexOfLastLog - itemsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  // Calculate total pages
  const totalPages = Math.ceil(logs.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-neutral-50 p-4 pb-24 flex flex-col items-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* Top Navigation */}
        <div className="flex justify-start gap-4 mb-8 text-gray-700 text-lg">
          <span className="font-bold text-gray-900 cursor-pointer" onClick={() => onNavigate('home')}>home</span>
          <span className="hover:text-gray-900 cursor-pointer" onClick={() => onNavigate('dashboard')}>dashboard</span>
          <span className="hover:text-gray-900 cursor-pointer" onClick={() => onNavigate('calendar')}>calendar</span>
        </div>

        {/* Header Section */}
        <div className="text-center mb-16 mt-8">
          <h1 className="text-6xl font-thin text-gray-900 mb-2 tracking-tight" style={{ fontFamily: '"Dancing Script", cursive' }}>tikk</h1>
          <p className="text-gray-700 text-lg font-normal">track how you spend time</p>
        </div>

        {/* Main Timer Section */}
        <div className="p-8 mb-8">
          {/* Timer Display */}
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-0">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="text-7xl md:text-8xl font-extralight text-black leading-none">
                  {formatTime(elapsedTime).hours}
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">hr</div>
              </div>
              <div className="text-7xl md:text-8xl font-extralight text-black leading-none">:</div>
              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="text-7xl md:text-8xl font-extralight text-black leading-none">
                  {formatTime(elapsedTime).minutes}
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">min</div>
              </div>
              <div className="text-7xl md:text-8xl font-extralight text-black leading-none">:</div>
              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="text-7xl md:text-8xl font-extralight text-black leading-none">
                  {formatTime(elapsedTime).seconds}
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">sec</div>
              </div>
              {/* Milliseconds - Separated and styled for stability */}
              <div className="flex flex-col items-center ml-1">
                <div className="text-4xl font-extralight text-black leading-none w-12 text-left">
                  .{formatTime(elapsedTime).milliseconds}
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1"></div>
              </div>
            </div>

            {/* Play/Pause Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => handleStartStop()}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isRunning
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#2B2B2B] hover:bg-black'
                }`}
              >
                {isRunning ? (
                  <div className="w-6 h-6 bg-white rounded-sm"></div>
                ) : (
                  <Play size={32} className="text-white ml-1" />
                )}
              </button>
            </div>
          </div>

          {/* Categories Section */}
          <div className="space-y-4 mt-8">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map(category => {
                const isSelected = selectedCategory === category.name && !isManagingCategories;
                const IconComponent = ICON_NAME_TO_COMPONENT_MAP[category.iconName];

                return (
                  <div key={category.id} className="relative">
                    {editingCategoryId === category.id ? (
                      // Editing state for a category
                      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm relative h-10">
                        <div
                          className="w-8 h-full flex items-center justify-center text-gray-800 text-xl cursor-pointer"
                          onClick={() => setShowIconPicker(true)}
                        >
                          {IconComponent && React.createElement(IconComponent, { size: 20, className: "text-gray-800" })}
                        </div>
                        {showIconPicker && (
                          <div ref={iconPickerRef} className="absolute z-10 top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 max-h-48 overflow-y-auto">
                            {AVAILABLE_ICONS.map((icon, index) => (
                              <span
                                key={index}
                                className="cursor-pointer p-1 hover:bg-gray-100 rounded-md text-xl text-center flex items-center justify-center"
                                onClick={() => {
                                  setTempCategoryIcon(icon.id);
                                  setShowIconPicker(false);
                                }}
                              >
                                {React.createElement(icon.component, { size: 20, className: "text-gray-800" })}
                              </span>
                            ))}
                          </div>
                        )}
                        <input
                          type="text"
                          value={tempCategoryName}
                          onChange={(e) => setTempCategoryName(e.target.value)}
                          className="px-2 py-2 border-none focus:outline-none min-w-0 flex-1 text-sm h-full"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveCategory(category.id)}
                        />
                        <button
                          onClick={() => handleSaveCategory(category.id)}
                          className="px-3 py-2 text-sm bg-gray-800 text-white rounded-full hover:bg-black transition-colors h-full"
                          title="Save Category"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={handleCancelCategoryEdit}
                          className="px-3 py-2 text-sm bg-gray-400 text-white rounded-full hover:bg-gray-500 transition-colors h-full"
                          title="Cancel Edit"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      // Normal or Management view for a category
                      isManagingCategories ? (
                        <div className="inline-flex items-center rounded-full border border-gray-300 bg-white shadow-sm transition-all duration-200 h-10 pr-2">
                          <button
                            onClick={() => handleCategoryClick(category.name)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-l-full text-sm font-medium text-gray-700 h-full"
                          >
                            {IconComponent && <IconComponent size={20} className="text-gray-800" />}
                            <span>{category.name}</span>
                          </button>
                          {/* Edit and Delete buttons directly inside the same flex container */}
                          <div className="flex items-center pl-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditCategory(category); }}
                              className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                              title="Edit Category"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                              className="p-1 rounded-full hover:bg-red-100 text-red-500"
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCategoryClick(category.name)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium h-10 ${
                            isSelected
                              ? 'bg-[#2B2B2B] text-white border-[#2B2B2B] shadow-md'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500 hover:shadow-sm'
                          }`}
                        >
                          {IconComponent && <IconComponent size={20} className={isSelected ? "text-white" : "text-gray-800"} />}
                          <span>{category.name}</span>
                        </button>
                      )
                    )}
                  </div>
                );
              })}

              {/* Add New Category Section / Manage Categories Button */}
              {isManagingCategories && showAddCategory ? (
                // This is the actual input form for adding a category
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm relative h-10">
                  <div
                    className="w-8 h-full flex items-center justify-center text-gray-800 text-xl cursor-pointer"
                    onClick={() => setShowIconPicker(true)}
                  >
                    {ICON_NAME_TO_COMPONENT_MAP[newCategoryIcon] && React.createElement(ICON_NAME_TO_COMPONENT_MAP[newCategoryIcon], { size: 20 })}
                  </div>
                  {showIconPicker && (
                    <div ref={iconPickerRef} className="absolute z-10 top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 max-h-48 overflow-y-auto">
                      {AVAILABLE_ICONS.map((icon, index) => (
                        <span
                          key={index}
                          className="cursor-pointer p-1 hover:bg-gray-100 rounded-md text-xl text-center flex items-center justify-center"
                          onClick={() => {
                            setNewCategoryIcon(icon.id);
                            setShowIconPicker(false);
                          }}
                        >
                          {React.createElement(icon.component, { size: 20, className: "text-gray-800" })}
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="px-2 py-2 border-none focus:outline-none min-w-0 flex-1 text-sm h-full"
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                  />
                  <button
                    onClick={addCategory}
                    className="px-3 py-2 text-sm bg-gray-800 text-white rounded-full hover:bg-black transition-colors h-full flex items-center justify-center"
                    disabled={isAddCategoryDisabled}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setShowAddCategory(false); setShowIconPicker(false); }}
                    className="px-3 py-2 text-sm bg-gray-400 text-white rounded-full hover:bg-gray-500 transition-colors h-full flex items-center justify-center"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                // This block contains the "Add category" button and the "Manage/Done" button
                <>
                  {isManagingCategories && (
                    <div className="relative group">
                      <button
                        onClick={() => setShowAddCategory(true)}
                        disabled={isAddCategoryDisabled}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 font-medium text-sm h-10 ${
                          isAddCategoryDisabled
                            ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'border-dashed border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Plus size={16} className="text-gray-800" />
                        <span>Add category</span>
                      </button>
                      {isAddCategoryDisabled && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                          Max {MAX_CATEGORIES} categories reached
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleManageCategoriesToggle}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 font-medium text-sm h-10 ${
                      isManagingCategories
                        ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                        : 'border-dashed border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Settings size={16} className={isManagingCategories ? "text-white" : "text-gray-800"} />
                    <span>{isManagingCategories ? 'Done' : 'Manage'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Description Input */}
          <div className="mb-6 mt-8">
            <input
              type="text"
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleDescriptionKeyPress}
              className="w-full px-5 py-3 rounded-xl border-none focus:outline-none text-base text-gray-700 placeholder-gray-400 text-center bg-neutral-50"
              style={{ borderBottom: '1px solid #e0e0e0' }}
            />
          </div>
        </div>

        {/* Logs Section */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 text-gray-800 pb-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity size={24} className="text-gray-800" />
              Recent Sessions
            </h2>
          </div>

          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-3 font-bold text-gray-500 text-sm tracking-wider">Sr</th>
                    <th className="text-left py-2 px-3 font-bold text-gray-500 text-sm tracking-wider">Category</th>
                    <th className="text-left py-2 px-3 font-bold text-gray-500 text-sm tracking-wider">Description</th>
                    <th className="text-left py-2 px-3 font-bold text-gray-500 text-sm tracking-wider">Duration</th>
                    <th className="text-left py-2 px-3 font-bold text-gray-500 text-sm tracking-wider">Timestamp</th>
                    <th className="text-center py-2 px-3 font-bold text-gray-500 text-sm tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log, index) => {
                    return (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3 text-gray-700 font-medium text-sm">
                          {logs.length - (indexOfFirstLog + index)}
                        </td>
                        <td className="py-2 px-3 text-gray-700 text-sm">
                          {editingLogId === log.id ? (
                            <select
                              value={editedCategory}
                              onChange={(e) => setEditedCategory(e.target.value)}
                              className="bg-gray-100 text-gray-800 rounded px-2 py-1 text-sm focus:outline-none border border-gray-200"
                            >
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                              ))}
                              <option value="Uncategorized">Uncategorized</option>
                            </select>
                          ) : (
                            log.category
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {editingLogId === log.id ? (
                            <input
                              type="text"
                              value={editedDescription}
                              onChange={(e) => setEditedDescription(e.target.value)}
                              className="w-full bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none font-medium text-sm rounded px-2 py-1"
                            />
                          ) : (
                            <span className="text-sm">{log.description}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-bold text-gray-800 text-sm">
                          {(() => {
                            const time = formatTime(log.duration);
                            if (parseInt(time.hours) > 0) {
                              return `${time.hours}h ${time.minutes}m`;
                            }
                            return `${time.minutes}m ${time.seconds}s`;
                          })()}
                        </td>
                        <td className="py-2 px-3 text-gray-600 text-sm">
                          {log.sessions[0]?.start && log.sessions[0]?.end ? (
                            <>
                              {new Date(log.sessions[0].start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              -
                              {new Date(log.sessions[0].end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="py-2 px-3 flex gap-2 justify-center">
                          {editingLogId === log.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(log.id)}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-gray-100 rounded-full transition-all duration-200"
                                title="Save Changes"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
                                title="Cancel Edit"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleResumeTracking(log)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
                                title="Resume Tracking"
                              >
                                <Play size={16} />
                              </button>
                              <button
                                onClick={() => handleEditLog(log)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
                                title="Edit Session"
                               >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteLog(log.id)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
                                title="Delete Session"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`px-3 py-1 rounded-full ${
                        currentPage === i + 1 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No sessions logged yet. Start tracking!</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Component ---
const Dashboard = ({ logs, categories, onNavigate }) => {
  const [timeClocked, setTimeClocked] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [categorySummary, setCategorySummary] = useState([]);
  const [filteredChartData, setFilteredChartData] = useState([]);
  const [lineChartCategoryFilter, setLineChartCategoryFilter] = useState('All');
  const [timeSeriesData, setTimeSeriesData] = useState([]);

  // Define a consistent color palette for charts (grayscale)
  const COLORS = ['#2B2B2B', '#4A4A4A', '#707070', '#A0A0A0', '#D0D0D0'];

  // Helper to format milliseconds to Hh Mm
  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate summary and chart data based on time range and category filter
  useEffect(() => {
    const now = Date.now();
    let filteredLogsByTimeRange = logs;

    if (selectedTimeRange === '24h') {
      filteredLogsByTimeRange = logs.filter(log => (now - new Date(log.timestamp).getTime()) <= 24 * 60 * 60 * 1000);
    } else if (selectedTimeRange === '1w') {
      filteredLogsByTimeRange = logs.filter(log => (now - new Date(log.timestamp).getTime()) <= 7 * 24 * 60 * 60 * 1000);
    }

    const totalTime = filteredLogsByTimeRange.reduce((sum, log) => sum + log.duration, 0);
    setTimeClocked(totalTime);

    const categoryTimes = {};
    filteredLogsByTimeRange.forEach(log => {
      categoryTimes[log.category] = (categoryTimes[log.category] || 0) + log.duration;
    });

    const summary = Object.keys(categoryTimes).map((categoryName, index) => {
      const duration = categoryTimes[categoryName];
      const percentage = totalTime > 0 ? ((duration / totalTime) * 100).toFixed(0) : 0;
      // Find the category object to get its iconName
      const categoryObj = categories.find(cat => cat.name === categoryName);
      const categoryIconComponent = categoryObj ? ICON_NAME_TO_COMPONENT_MAP[categoryObj.iconName] : null; // Get component from map

      return {
        name: categoryName,
        duration: duration,
        formattedDuration: formatDuration(duration),
        percentage: `${percentage}%`,
        color: COLORS[index % COLORS.length],
        iconComponent: categoryIconComponent // Pass the icon component
      };
    });
    setCategorySummary(summary);

    // Bar and Pie charts always show all categories for the selected time range
    setFilteredChartData(summary);

    // --- Prepare Time Series Data for Line Chart ---
    let logsForLineChart = filteredLogsByTimeRange;
    if (lineChartCategoryFilter !== 'All') {
      logsForLineChart = logsForLineChart.filter(log => log.category === lineChartCategoryFilter);
    }

    const newTimeSeriesData = [];
    if (selectedTimeRange === '24h') {
      // Data for last 24 hours (hourly)
      const currentHour = new Date().getHours();
      for (let i = 0; i < 24; i++) {
        const hour = (currentHour - i + 24) % 24;
        const hourLabel = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
        newTimeSeriesData.unshift({ time: hourLabel, duration: 0 });
      }

      logsForLineChart.forEach(log => {
        const logHour = new Date(log.timestamp).getHours();
        const index = newTimeSeriesData.findIndex(d => {
          const chartHour = parseInt(d.time.split(' ')[0]);
          const isPM = d.time.includes('PM');
          let formattedChartHour = chartHour;
          if (isPM && chartHour !== 12) formattedChartHour += 12;
          if (!isPM && chartHour === 12) formattedChartHour = 0;

          return formattedChartHour === logHour;
        });
        if (index !== -1) {
          newTimeSeriesData[index].duration += log.duration;
        }
      });

    } else if (selectedTimeRange === '1w') {
      // Data for last 7 days (daily)
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayLabel = daysOfWeek[date.getDay()];
        newTimeSeriesData.unshift({ time: dayLabel, duration: 0 });
      }

      logsForLineChart.forEach(log => {
        const logDay = new Date(log.timestamp).getDay();
        const index = newTimeSeriesData.findIndex(d => daysOfWeek.indexOf(d.time) === logDay);
        if (index !== -1) {
          newTimeSeriesData[index].duration += log.duration;
        }
      });
    }
    setTimeSeriesData(newTimeSeriesData);

  }, [selectedTimeRange, lineChartCategoryFilter, logs, categories]);

  return (
    <div className="min-h-screen bg-neutral-50 p-4 flex flex-col items-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* Top Navigation */}
        <div className="flex justify-start gap-4 mb-8 text-gray-700 text-lg">
          <span className="hover:text-gray-900 cursor-pointer" onClick={() => onNavigate('home')}>home</span>
          <span className="font-bold text-gray-900 cursor-pointer" onClick={() => onNavigate('dashboard')}>dashboard</span>
          <span className="hover:text-gray-900 cursor-pointer" onClick={() => onNavigate('calendar')}>calendar</span>
        </div>

        {/* Header Section */}
        <div className="text-center mb-16 mt-8">
          <h1 className="text-6xl font-thin text-gray-900 mb-2 tracking-tight" style={{ fontFamily: '"Dancing Script", cursive' }}>tikk</h1>
          <p className="text-gray-700 text-lg font-normal">track how you spend time</p>
        </div>

        {/* Dashboard Content */}
        <div className="p-8 mb-8">
          {/* Time Clocked Section */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Time Clocked</h2>
              <p className="text-gray-700 text-3xl font-semibold">{formatDuration(timeClocked)}</p>
            </div>
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setSelectedTimeRange('24h')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTimeRange === '24h' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 24 hours
              </button>
              <button
                onClick={() => setSelectedTimeRange('1w')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTimeRange === '1w' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 1 week
              </button>
            </div>
          </div>

          {/* Category Summary and Charts */}
          <div className="flex flex-col gap-8 mb-12">
            {/* Category Breakdown (Upper half) */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h3>
              {categorySummary.length > 0 ? (
                <ul>
                  {categorySummary.map((item, index) => (
                    <li key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        {item.iconComponent && <item.iconComponent size={20} className="text-gray-800" />}
                        <span className="text-gray-700 font-medium text-sm">{item.name}</span>
                      </div>
                      <div className="text-gray-600 text-sm">
                        {item.formattedDuration} ({item.percentage})
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">No data for selected period.</p>
              )}
            </div>

            {/* Charts (Second vertical half, in a horizontal row) */}
            <div className="flex flex-col md:flex-row gap-8 w-full items-start">
              {/* Horizontal Bar Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Time per Category</h3>
                <div className="flex-grow h-48"> {/* Explicit height for the chart area */}
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart layout="vertical" data={filteredChartData}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={80} tickLine={false} axisLine={false} style={{ fontSize: '14px', fill: '#4A4A4A' }} />
                      <Tooltip formatter={(value) => formatDuration(value)} />
                      <Bar dataKey="duration" barSize={20} radius={[10, 10, 10, 10]}>
                        {
                          filteredChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))
                        }
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart and Legend Container */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h3>
                <div className="flex-grow flex items-center justify-center h-48 pt-4"> {/* Explicit height for chart area, adjusted pt-4 */}
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredChartData}
                        dataKey="duration"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        fill="#8884d8"
                        labelLine={false}
                      >
                        {filteredChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${formatDuration(value)} (${props.payload.percentage})`, props.payload.name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Custom Legend for Pie Chart */}
                <div className="w-full p-2 pl-4 pt-4"> {/* Increased pt-4 to move legend lower */}
                  {filteredChartData.length > 0 ? (
                    <ul className="text-sm space-y-3"> {/* Increased space-y for more gap */}
                      {filteredChartData.map((entry, index) => (
                        <li key={`legend-${index}`} className="flex items-center">
                          <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: entry.color }}></span>
                          <span className="text-gray-700 font-medium">{entry.name} ({entry.percentage})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center md:text-left text-sm">No data to display.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Over-Timeframe Line Chart (Third row) */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Spent Over Period</h3>
              {/* Category Filter for Line Chart - Moved inside this box */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <button
                  onClick={() => setLineChartCategoryFilter('All')}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-200 text-sm font-medium ${
                    lineChartCategoryFilter === 'All'
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500 hover:shadow-sm'
                  }`}
                >
                  All
                </button>
                {categories.map(category => {
                  const IconComponent = ICON_NAME_TO_COMPONENT_MAP[category.iconName];
                  return (
                    <button
                      key={category.id}
                      onClick={() => setLineChartCategoryFilter(category.name)}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-200 text-sm font-medium ${
                        lineChartCategoryFilter === category.name
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500 hover:shadow-sm'
                      }`}
                    >
                      {IconComponent && <IconComponent size={16} className="text-gray-800" />}
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="h-64"> {/* Set a flexible height for the chart area */}
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                    <XAxis dataKey="time" tick={{ fill: '#4A4A4A', fontSize: 14 }} tickLine={false} axisLine={true} />
                    <YAxis tickFormatter={(value) => formatDuration(value)} tick={{ fill: '#4A4A4A', fontSize: 14 }} tickLine={false} axisLine={true} />
                    <Tooltip formatter={(value) => formatDuration(value)} />
                    <Line type="monotone" dataKey="duration" stroke="#2B2B2B" strokeWidth={2} dot={{ stroke: '#2B2B2B', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {timeSeriesData.length === 0 && (
                <p className="text-center text-gray-500 py-4 text-sm">No time data for this period.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CalendarPage Component ---
const CalendarPage = ({ logs, categories, onNavigate, currentPage }) => { // Added currentPage prop
  const [currentView, setCurrentView] = useState('day'); // Changed default to 'day'
  const [selectedDate, setSelectedDate] = useState(new Date()); // Current date for navigation

  // Helper function to format duration for display
  const formatDurationForDisplay = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor((totalSeconds % 60000) / 1000);

    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 && hours === 0) parts.push(`${seconds}s`);
    return parts.length > 0 ? parts.join(' ') : '0s';
  };


  // Helper functions for date manipulation
  const startOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 for Sunday, 6 for Saturday
    const diff = d.getDate() - day; // Adjust to Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 for Sunday, 6 for Saturday
    const diff = d.getDate() + (6 - day); // Adjust to Saturday
    d.setDate(diff);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const startOfMonth = (date) => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfMonth = (date) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1, 0); // Set to last day of current month
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const getDayName = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  // Navigation handlers
  const handlePrev = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      if (currentView === 'day') {
        newDate.setDate(newDate.getDate() - 1);
      } else if (currentView === 'week') {
        newDate.setDate(newDate.getDate() - 7);
      } else if (currentView === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (currentView === 'year') {
        newDate.setFullYear(newDate.getFullYear() - 1);
      }
      return newDate;
    });
  };

  const handleNext = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      if (currentView === 'day') {
        newDate.setDate(newDate.getDate() + 1);
      } else if (currentView === 'week') {
        newDate.setDate(newDate.getDate() + 7);
      } else if (currentView === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (currentView === 'year') {
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
      return newDate;
    });
  };

  const handleToday = () => {
    setSelectedDate(new Date());
    setCurrentView('day'); // Go to day view when "Today" is clicked
  };

  const getHeaderTitle = () => {
    if (currentView === 'day') {
      return selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (currentView === 'week') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (currentView === 'month') {
      return selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } else if (currentView === 'year') {
      return selectedDate.toLocaleDateString('en-US', { year: 'numeric' });
    }
    return '';
  };

  const filterLogsByDateRange = (startDate, endDate) => {
    return logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= startDate.getTime() && logTime <= endDate.getTime();
    });
  };

  // Render specific view components
  const renderDayView = () => {
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const logsForDay = filterLogsByDateRange(dayStart, dayEnd).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const timeSlots = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      timeSlots.push(`${hour}:00`);
    }

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Day View</h3>
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-2 text-sm">
          <div className="md:col-span-1 font-bold text-gray-600">Time</div>
          <div className="md:col-span-1 font-bold text-gray-600">Activity</div>
          {timeSlots.map(slot => (
            <React.Fragment key={slot}>
              <div className="py-2 px-2 border-b border-gray-100 text-gray-500">{slot}</div>
              <div className="py-2 px-2 border-b border-gray-100">
                {logsForDay.filter(log => new Date(log.timestamp).getHours() === parseInt(slot.split(':')[0]))
                  .map(log => (
                    <div key={log.id} className="bg-gray-100 rounded-md p-2 mb-1 text-gray-800 text-xs relative"> {/* Added relative for positioning */}
                      <p className="font-medium">{log.description}</p>
                      <p className="text-gray-600">{log.category} - {formatDurationForDisplay(log.duration)}</p>
                      {log.sessions[0]?.start && log.sessions[0]?.end && (
                        <p className="absolute bottom-1 right-2 text-gray-500 text-[10px]"> {/* Adjusted font size and position */}
                          {new Date(log.sessions[0].start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          -
                          {new Date(log.sessions[0].end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </React.Fragment>
          ))}
          {logsForDay.length === 0 && (
            <div className="md:col-span-2 text-center text-gray-500 py-4">No activities logged for this day.</div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate);
    const daysInWeek = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      daysInWeek.push(d);
    }

    // Reorder days to start from Monday (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
    const orderedDays = [
      daysInWeek[1], // Monday
      daysInWeek[2], // Tuesday
      daysInWeek[3], // Wednesday
      daysInWeek[4], // Thursday
      daysInWeek[5], // Friday
      daysInWeek[6], // Saturday
      daysInWeek[0]  // Sunday
    ];

    const weekdays = orderedDays.slice(0, 5); // Mon-Fri
    const weekendDays = orderedDays.slice(5, 7); // Sat-Sun

    const logsForWeek = filterLogsByDateRange(startOfWeek(selectedDate), endOfWeek(selectedDate));

    const renderDaySummary = (day) => {
      const logsForThisDay = logsForWeek.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.getDate() === day.getDate() && logDate.getMonth() === day.getMonth() && logDate.getFullYear() === day.getFullYear();
      });

      const categorySummaryForDay = {};
      logsForThisDay.forEach(log => {
        categorySummaryForDay[log.category] = (categorySummaryForDay[log.category] || 0) + log.duration;
      });

      return (
        <div
          key={day.toDateString()}
          className="border rounded-lg p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => { setCurrentView('day'); setSelectedDate(day); }}
        >
          <h4 className="font-bold text-gray-700 mb-2 text-center">{getDayName(day)} {day.getDate()}</h4>
          <div className="space-y-1">
            {Object.keys(categorySummaryForDay).length > 0 ? (
              Object.keys(categorySummaryForDay).map(categoryName => (
                <div key={categoryName} className="flex justify-between items-center text-gray-800 text-xs bg-gray-100 rounded-md px-2 py-1">
                  <span className="font-medium">{categoryName}</span>
                  <span className="text-gray-600">{formatDurationForDisplay(categorySummaryForDay[categoryName])}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs text-center py-2">No activities</p>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Week View</h3>
        <div className="grid grid-cols-5 gap-4 mb-4"> {/* Monday to Friday */}
          {weekdays.map(renderDaySummary)}
        </div>
        <div className="grid grid-cols-2 gap-4"> {/* Saturday and Sunday */}
          {weekendDays.map(renderDaySummary)}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const days = getDaysInMonth(year, month);

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sunday
    const emptyCellsBefore = Array(firstDayOfMonth).fill(null);

    const lastDayOfMonth = new Date(year, month + 1, 0).getDay(); // 0 for Sunday
    const emptyCellsAfter = Array(6 - lastDayOfMonth).fill(null);

    const allCells = [...emptyCellsBefore, ...days, ...emptyCellsAfter];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Month View</h3>
        <div className="grid grid-cols-7 text-center font-bold text-gray-700 mb-2">
          {dayNames.map((day, index) => <div key={day + index}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {allCells.map((day, index) => (
            <div
              key={index}
              className={`p-2 border border-gray-100 rounded-md h-20 flex flex-col items-center justify-center ${
                day ? 'bg-gray-50 text-gray-800 cursor-pointer hover:bg-gray-100 transition-colors' : 'bg-gray-100 text-gray-400'
              } ${day && day.toDateString() === new Date().toDateString() ? 'border-gray-900 ring-2 ring-gray-900' : ''}`}
              onClick={() => day && (setCurrentView('day'), setSelectedDate(day))} // Click handler for valid days
            >
              {day ? day.getDate() : ''}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const year = selectedDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Year View</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {months.map((month, monthIndex) => (
            <div key={month.toDateString()} className="border border-gray-200 rounded-lg p-4 text-center bg-gray-50">
              <h4 className="font-bold text-gray-700 mb-2">{month.toLocaleDateString('en-US', { month: 'long' })}</h4>
              <div className="grid grid-cols-7 text-xs text-gray-500">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, dayIndex) => <div key={day + dayIndex}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs mt-1">
                {Array.from({ length: new Date(year, monthIndex + 1, 0).getDate() }, (_, i) => i + 1).map(dateNum => (
                  <div
                    key={dateNum}
                    className={`p-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors ${
                      new Date(year, monthIndex, dateNum).toDateString() === new Date().toDateString() ? 'bg-gray-900 text-white' : ''
                    }`}
                    onClick={() => { setCurrentView('day'); setSelectedDate(new Date(year, monthIndex, dateNum)); }}
                  >
                    {dateNum}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-neutral-50 p-4 flex flex-col items-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* Top Navigation */}
        <div className="flex justify-start gap-4 mb-8 text-gray-700 text-lg">
          <span className={`${currentPage === 'home' ? 'font-bold text-gray-900' : 'hover:text-gray-900'} cursor-pointer`} onClick={() => onNavigate('home')}>home</span>
          <span className={`${currentPage === 'dashboard' ? 'font-bold text-gray-900' : 'hover:text-gray-900'} cursor-pointer`} onClick={() => onNavigate('dashboard')}>dashboard</span>
          <span className={`${currentPage === 'calendar' ? 'font-bold text-gray-900' : 'hover:text-gray-900'} cursor-pointer`} onClick={() => onNavigate('calendar')}>calendar</span>
        </div>

        {/* Header Section */}
        <div className="text-center mb-16 mt-8">
          <h1 className="text-6xl font-thin text-gray-900 mb-2 tracking-tight" style={{ fontFamily: '"Dancing Script", cursive' }}>tikk</h1>
          <p className="text-gray-700 text-lg font-normal">your time, visualized</p>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 text-gray-800 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex space-x-2">
              {['day', 'week', 'month', 'year'].map(view => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    currentView === view ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                title="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              {/* Adjusted font size for header title */}
              <h3 className="text-sm font-semibold text-gray-800 min-w-[150px] text-center md:text-base">{getHeaderTitle()}</h3> {/* Changed text-lg to text-sm */}
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                title="Next"
              >
                <ChevronRight size={20} />
              </button>
              {/* Today button */}
              <button
                onClick={handleToday}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="Go to Today"
              >
                Today
              </button>
            </div>
          </div>

          {/* Render current calendar view */}
          {currentView === 'day' && renderDayView()}
          {currentView === 'week' && renderWeekView()}
          {currentView === 'month' && renderMonthView()}
          {currentView === 'year' && renderYearView()}
        </div>
      </div>
    </div>
  );
};


// --- MainApp Component (New Parent Component) ---
const MainApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  // Initialize logs from localStorage or an empty array
  const [logs, setLogs] = useState(() => {
    try {
      const storedLogs = localStorage.getItem('timeTrackerLogs');
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (error) {
      console.error("Error parsing logs from localStorage:", error);
      return [];
    }
  });

  // Initialize categories from localStorage or default values
  const [categories, setCategories] = useState(() => {
    try {
      const storedCategories = localStorage.getItem('timeTrackerCategories');
      return storedCategories ? JSON.parse(storedCategories) : [
        { id: 1, name: 'GRE Prep', iconName: 'Book' },
        { id: 2, name: 'Portfolio', iconName: 'Briefcase' },
        { id: 3, name: 'Projects', iconName: 'Settings' },
        { id: 4, name: 'Health', iconName: 'Heart' },
        { id: 5, name: 'Household Tasks', iconName: 'Home' },
        { id: 6, name: 'Habits', iconName: 'Activity' },
        { id: 7, name: 'Break', iconName: 'Gamepad' }
      ];
    } catch (error) {
      console.error("Error parsing categories from localStorage:", error);
      return [
        { id: 1, name: 'GRE Prep', iconName: 'Book' },
        { id: 2, name: 'Portfolio', iconName: 'Briefcase' },
        { id: 3, name: 'Projects', iconName: 'Settings' },
        { id: 4, name: 'Health', iconName: 'Heart' },
        { id: 5, name: 'Household Tasks', iconName: 'Home' },
        { id: 6, name: 'Habits', iconName: 'Activity' },
        { id: 7, name: 'Break', iconName: 'Gamepad' }
      ];
    }
  });

  // Effect to save logs to localStorage whenever logs change
  useEffect(() => {
    try {
      localStorage.setItem('timeTrackerLogs', JSON.stringify(logs));
    } catch (error) {
      console.error("Error saving logs to localStorage:", error);
    }
  }, [logs]);

  // Effect to save categories to localStorage whenever categories change
  useEffect(() => {
    try {
      localStorage.setItem('timeTrackerCategories', JSON.stringify(categories));
    }
    catch (error) {
      console.error("Error saving categories to localStorage:", error);
    }
  }, [categories]);

  // Effect to set document title and favicon
  useEffect(() => {
    document.title = "tikk - track your time";

    // Create a simple SVG clock icon as a data URI
    const faviconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    `;
    const encodedFavicon = `data:image/svg+xml;base64,${btoa(faviconSvg)}`;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = encodedFavicon;
  }, []); // Empty dependency array means this runs once on mount


  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif' }}>
      {/* Google Font Imports (placed here to apply to the whole app) */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />

      {currentPage === 'home' ? (
        <App
          logs={logs}
          setLogs={setLogs}
          categories={categories}
          setCategories={setCategories}
          onNavigate={handleNavigate}
        />
      ) : currentPage === 'dashboard' ? (
        <Dashboard
          logs={logs}
          categories={categories}
          onNavigate={handleNavigate}
        />
      ) : currentPage === 'calendar' ? (
        <CalendarPage
          logs={logs}
          categories={categories}
          onNavigate={handleNavigate}
          currentPage={currentPage} // Pass currentPage to CalendarPage
        />
      ) : null}
    </div>
  );
};

export default MainApp;
