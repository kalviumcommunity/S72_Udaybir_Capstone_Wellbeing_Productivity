
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  ThumbsUp, 
  MessageSquare, 
  Download, 
  Share2,
  X
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { getNotes, createNote } from '@/services/noteService';
import { useFormPersistence } from '@/hooks/useFormPersistence';

import { toast } from '@/hooks/use-toast';

// Types for our notes
interface Comment {
  id: string;
  noteId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
}

interface Note {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: number;
  downloads: number;
  likedBy?: string[]; // Array of user IDs who liked the note
}

// Sample categories
const categories = [
  'All',
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Business',
  'Economics',
  'Psychology',
  'Literature',
  'History'
];

// Empty initial notes - Notes will be loaded from localStorage or API
const mockNotes: Note[] = [];

const NotesHub = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'global' | 'my-notes'>('global');
  
  // New note form state with persistence
  const [newNote, setNewNote, clearNewNote] = useFormPersistence({
    key: 'note_form',
    initialValue: {
      title: '',
      description: '',
      content: '',
      category: 'Computer Science',
      tags: ''
    }
  });

  // Load notes from localStorage or use mock data
  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      try {
        // Try to get notes from API first
        const apiNotes = await getNotes();
        if (apiNotes && apiNotes.length > 0) {
          setNotes(apiNotes);
        } else {
          // Load from localStorage or use mock data
          const storedNotes = localStorage.getItem('global_notes');
          if (storedNotes) {
            const parsedNotes = JSON.parse(storedNotes);
            // Convert date strings back to Date objects
            const notesWithDates = parsedNotes.map((note: Partial<Note> & { createdAt: string; updatedAt: string }) => ({
              ...note,
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt)
            } as Note));
            setNotes(notesWithDates);
          } else {
            // First time: use mock data and save to localStorage
            setNotes(mockNotes);
            localStorage.setItem('global_notes', JSON.stringify(mockNotes));
          }
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        // Load from localStorage or use mock data
        const storedNotes = localStorage.getItem('global_notes');
        if (storedNotes) {
          const parsedNotes = JSON.parse(storedNotes);
          const notesWithDates = parsedNotes.map((note: Partial<Note> & { createdAt: string; updatedAt: string }) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          } as Note));
          setNotes(notesWithDates);
        } else {
          setNotes(mockNotes);
          localStorage.setItem('global_notes', JSON.stringify(mockNotes));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [currentUser]);
  
  // Filter notes based on search query and category
  useEffect(() => {
    let filtered = [...notes];
    
    // Filter by view mode
    if (currentUser && viewMode === 'my-notes') {
      filtered = filtered.filter(note => note.author.id === currentUser.id);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.description.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }
    
    setFilteredNotes(filtered);
  }, [searchQuery, selectedCategory, notes, viewMode, currentUser]);
  
  const handleCreateNote = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!newNote.title || !newNote.description || !newNote.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Try to create note with API
    const createdNote = await createNote(newNote);
    
    if (createdNote) {
      // Note was created via API
      setNotes([createdNote, ...notes]);
    } else {
      // Fallback to mock creation
      const newNoteObject: Note = {
        id: Date.now().toString(), // Use timestamp for unique ID
        title: newNote.title,
        description: newNote.description,
        content: newNote.content,
        category: newNote.category,
        tags: newNote.tags.split(',').map(tag => tag.trim()),
        author: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        comments: 0,
        downloads: 0
      };
      
      const updatedNotes = [newNoteObject, ...notes];
      setNotes(updatedNotes);
      
      // Save to global notes localStorage
      localStorage.setItem('global_notes', JSON.stringify(updatedNotes));
      
      toast({
        title: "Success!",
        description: "Note created successfully and saved locally"
      });
    }
    
    setIsCreatingNote(false);
    // Reset form
    clearNewNote();
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle like/unlike a note
  const handleLikeNote = (noteId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        const likedBy = note.likedBy || [];
        const isLiked = likedBy.includes(currentUser.id);
        
        if (isLiked) {
          // Unlike
          return {
            ...note,
            likes: note.likes - 1,
            likedBy: likedBy.filter(id => id !== currentUser.id)
          };
        } else {
          // Like
          return {
            ...note,
            likes: note.likes + 1,
            likedBy: [...likedBy, currentUser.id]
          };
        }
      }
      return note;
    });

    setNotes(updatedNotes);
    localStorage.setItem('global_notes', JSON.stringify(updatedNotes));
  };

  // Handle adding a comment
  const handleAddComment = (noteId: string, commentContent: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!commentContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a comment.",
        variant: "destructive"
      });
      return;
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      noteId,
      content: commentContent.trim(),
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      createdAt: new Date()
    };

    // Save comment to localStorage
    const storedComments = JSON.parse(localStorage.getItem('note_comments') || '[]');
    storedComments.push(newComment);
    localStorage.setItem('note_comments', JSON.stringify(storedComments));

    // Update note comment count
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          comments: note.comments + 1
        };
      }
      return note;
    });

    setNotes(updatedNotes);
    localStorage.setItem('global_notes', JSON.stringify(updatedNotes));

    toast({
      title: "Success!",
      description: "Comment added successfully"
    });
  };

  // Get comments for a note
  const getCommentsForNote = (noteId: string): Comment[] => {
    const storedComments = JSON.parse(localStorage.getItem('note_comments') || '[]');
    return storedComments
      .filter((comment: Comment) => comment.noteId === noteId)
      .map((comment: Partial<Comment> & { createdAt: string }) => ({
        ...comment,
        createdAt: new Date(comment.createdAt)
      } as Comment))
      .sort((a: Comment, b: Comment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };


  
  return (
    <div className="page-container">
      <header className="mb-8 animate-slide-in">
        <h1 className="text-3xl font-bold tracking-tight">
          {currentUser && viewMode === 'my-notes' ? `${currentUser.name}'s Notes` : 'Global Notes Hub'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {currentUser && viewMode === 'my-notes'
            ? 'Your personal collection of study notes and resources'
            : 'Share and discover study notes from students around the world. Contribute your knowledge to help others learn!'
          }
        </p>
      </header>
      

      
      {/* View Mode Toggle */}
      {currentUser && (
        <div className="flex justify-center mb-6">
          <div className="bg-muted rounded-lg p-1 flex">
            <button
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                viewMode === 'global'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewMode('global')}
            >
              Global Notes
            </button>
            <button
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                viewMode === 'my-notes'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewMode('my-notes')}
            >
              My Notes
            </button>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search notes by title, description, or tags..."
            className="hub-input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select
              className="hub-input appearance-none pr-8"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <button
            className="hub-button flex items-center gap-2"
            onClick={() => currentUser ? setIsCreatingNote(true) : navigate('/login')}
          >
            <Plus className="h-4 w-4" />
            Add Note
          </button>
        </div>
      </div>
      
      {/* Create Note Form */}
      {isCreatingNote && (
        <div className="hub-card p-6 mb-8 animate-scale-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create New Note</h2>
            <button
              className="hub-icon-button p-1"
              onClick={() => setIsCreatingNote(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="hub-input"
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                placeholder="e.g., Data Structures and Algorithms"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                className="hub-input"
                value={newNote.description}
                onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                placeholder="Brief description of your notes"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                className="hub-input min-h-[200px]"
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                placeholder="Full content of your notes..."
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="hub-input"
                  value={newNote.category}
                  onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                >
                  {categories.filter(c => c !== 'All').map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  className="hub-input"
                  value={newNote.tags}
                  onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                  placeholder="e.g., algorithms, sorting, data structures"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                className="hub-button sentience-button-outline mr-2"
                onClick={() => setIsCreatingNote(false)}
              >
                Cancel
              </button>
              <button
                className="hub-button"
                onClick={handleCreateNote}
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        </div>
      )}
      
      {/* Notes grid */}
      {!isLoading && filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="hub-card group overflow-hidden hover:transform hover:scale-[1.02] transition-all"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <Link to={`/notes/${note.id}`}>
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {note.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {note.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 my-3">
                  <span className="hub-tag bg-primary/10 text-primary">
                    {note.category}
                  </span>
                  {note.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index} 
                      className="hub-tag bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="hub-tag bg-muted text-muted-foreground">
                      +{note.tags.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <img 
                      src={note.author.avatar} 
                      alt={note.author.name} 
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium">{note.author.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(note.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLikeNote(note.id);
                      }}
                      className={`flex items-center text-xs transition-colors ${
                        currentUser && note.likedBy?.includes(currentUser.id)
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${
                        currentUser && note.likedBy?.includes(currentUser.id)
                          ? 'fill-current'
                          : ''
                      }`} />
                      {note.likes}
                    </button>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      {note.comments}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Download className="h-3.5 w-3.5 mr-1" />
                      {note.downloads}
                    </div>
                  </div>
                  <Share2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !isLoading ? (
        <div className="hub-card p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-medium mb-2">
            {searchQuery || selectedCategory !== 'All' ? "No notes found" : "No notes yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory !== 'All'
              ? "Try adjusting your search or category filters"
              : currentUser && viewMode === 'my-notes'
                ? "Start creating your first study note to organize your learning"
                : "Be the first to contribute study notes to the global community!"
            }
          </p>
          <button
            className="hub-button mx-auto flex items-center gap-2"
            onClick={() => currentUser ? setIsCreatingNote(true) : navigate('/login')}
          >
            <Plus className="h-4 w-4" />
            {currentUser && viewMode === 'my-notes' ? "Create Your First Note" : currentUser ? "Share Your First Note" : "Add Note"}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default NotesHub;
