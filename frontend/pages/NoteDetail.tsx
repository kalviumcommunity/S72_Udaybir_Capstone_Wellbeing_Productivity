
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  BookOpen, 
  ThumbsUp, 
  Download, 
  Share2, 
  MessageSquare,
  Send,
  User,
  Edit,
  Trash
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';

// Types
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

interface Comment {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
}

// Empty mock data - Will be loaded from localStorage or API
const mockNotes: Note[] = [];

// Empty comments
const mockComments: Record<string, Comment[]> = {};

const NoteDetail = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  
  const [note, setNote] = useState<Note | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  
  // Fetch note and comments
  useEffect(() => {
    if (!noteId) return;
    
    // Try to load from localStorage first
    const storedNotes = JSON.parse(localStorage.getItem('global_notes') || '[]');
    const foundNote = storedNotes.find((n: Note) => n.id === noteId);
    
    if (foundNote) {
      // Convert date strings back to Date objects
      const noteWithDates = {
        ...foundNote,
        createdAt: new Date(foundNote.createdAt),
        updatedAt: new Date(foundNote.updatedAt)
      };
      setNote(noteWithDates);
      
      // Load comments from localStorage
      const storedComments = JSON.parse(localStorage.getItem('note_comments') || '[]');
      const noteComments = storedComments
        .filter((comment: { noteId: string }) => comment.noteId === noteId)
        .map((comment: { id: string; content: string; author: { id: string; name: string; avatar: string }; createdAt: string }) => ({
          id: comment.id,
          text: comment.content,
          author: comment.author,
          createdAt: new Date(comment.createdAt)
        }));
      setComments(noteComments);
      
      // Set like status
      if (currentUser && noteWithDates.likedBy?.includes(currentUser.id)) {
        setHasLiked(true);
      }
    } else {
      // Fallback to mock data
      const mockFoundNote = mockNotes.find(n => n.id === noteId);
      if (mockFoundNote) {
        setNote(mockFoundNote);
        setComments(mockComments[noteId] || []);
      } else {
        // Note not found, redirect to notes hub
        navigate('/notes');
      }
    }
  }, [noteId, navigate, currentUser]);
  
  if (!note) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }
  
  const handleAddComment = () => {
    if (!currentUser || !newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      createdAt: new Date()
    };
    
    // Save comment to localStorage
    const storedComments = JSON.parse(localStorage.getItem('note_comments') || '[]');
    storedComments.push({
      ...comment,
      noteId: note.id,
      content: comment.text // Match the interface from NotesHub
    });
    localStorage.setItem('note_comments', JSON.stringify(storedComments));
    
    setComments([...comments, comment]);
    setNewComment('');
    
    // Update the comment count in the note
    const updatedNote = {
      ...note,
      comments: note.comments + 1
    };
    setNote(updatedNote);
    
    // Update the note in localStorage
    const storedNotes = JSON.parse(localStorage.getItem('global_notes') || '[]');
    const updatedNotes = storedNotes.map((storedNote: Partial<Note> & { id: string }) => 
      storedNote.id === note.id ? updatedNote : storedNote
    );
    localStorage.setItem('global_notes', JSON.stringify(updatedNotes));
  };
  
  const toggleLike = () => {
    if (!currentUser) return;
    
    const newHasLiked = !hasLiked;
    setHasLiked(newHasLiked);
    
    const updatedNote = {
      ...note,
      likes: newHasLiked ? note.likes + 1 : note.likes - 1,
      likedBy: newHasLiked 
        ? [...(note.likedBy || []), currentUser.id]
        : (note.likedBy || []).filter(id => id !== currentUser.id)
    };
    setNote(updatedNote);
    
    // Update the note in localStorage
    const storedNotes = JSON.parse(localStorage.getItem('global_notes') || '[]');
    const updatedNotes = storedNotes.map((storedNote: Partial<Note> & { id: string }) => 
      storedNote.id === note.id ? updatedNote : storedNote
    );
    localStorage.setItem('global_notes', JSON.stringify(updatedNotes));
  };
  
  const handleDownload = () => {
    // In a real app, this would generate a PDF or file download
    alert('Downloading note...');
    
    // Update the download count
    setNote({
      ...note,
      downloads: note.downloads + 1
    });
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="page-container">
      <div className="flex items-center mb-6">
        <Link to="/notes" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notes
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="hub-card p-6 animate-fade-in">
            {/* Note header */}
            <div className="border-b border-border pb-4 mb-6">
              <h1 className="text-2xl font-bold mb-2">{note.title}</h1>
              <p className="text-muted-foreground">{note.description}</p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="hub-tag bg-primary/10 text-primary">
                  {note.category}
                </span>
                {note.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="hub-tag bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Note content */}
            <div className="prose prose-blue max-w-none">
              <pre className="whitespace-pre-wrap text-sm">{note.content}</pre>
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-border">
              <button 
                className={cn(
                  "flex items-center gap-2 hub-button",
                  hasLiked ? "bg-primary" : "bg-muted text-foreground hover:bg-muted/80"
                )}
                onClick={toggleLike}
              >
                <ThumbsUp className="h-4 w-4" />
                {hasLiked ? 'Liked' : 'Like'}
                <span className="ml-1">({note.likes})</span>
              </button>
              
              <button 
                className="flex items-center gap-2 hub-button bg-muted text-foreground hover:bg-muted/80"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                Download
                <span className="ml-1">({note.downloads})</span>
              </button>
              
              <button 
                className="flex items-center gap-2 hub-button bg-muted text-foreground hover:bg-muted/80"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
          
          {/* Comments section */}
          <div className="hub-card p-6 mt-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Comments ({comments.length})
            </h2>
            
            {/* Add comment */}
            <div className="mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  {currentUser ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <textarea
                    className="hub-input min-h-[100px]"
                    placeholder={currentUser ? "Add a comment..." : "Sign in to comment..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!currentUser}
                  />
                  
                  <div className="flex justify-end mt-2">
                    <button
                      className="hub-button flex items-center gap-1"
                      onClick={handleAddComment}
                      disabled={!currentUser || !newComment.trim()}
                    >
                      <Send className="h-4 w-4" />
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comments list */}
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 pb-4 border-b border-border last:border-0">
                    <div className="flex-shrink-0">
                      <img 
                        src={comment.author.avatar} 
                        alt={comment.author.name}
                        className="w-10 h-10 rounded-full"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-medium">{comment.author.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)} at {formatTime(comment.createdAt)}
                        </span>
                      </div>
                      
                      <p className="mt-1 text-sm">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div>
          {/* Author info */}
          <div className="hub-card p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">About the Author</h2>
            
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={note.author.avatar} 
                alt={note.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-medium">{note.author.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Published on {formatDate(note.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Notes:</span>
                <span className="font-medium">
                  {mockNotes.filter(n => n.author.id === note.author.id).length}
                </span>
              </div>
            </div>
          </div>
          
          {/* Related notes */}
          <div className="hub-card p-6 mt-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Related Notes</h2>
            
            <div className="space-y-4">
              {mockNotes
                .filter(n => n.id !== note.id && n.category === note.category)
                .slice(0, 3)
                .map((relatedNote) => (
                  <Link
                    key={relatedNote.id}
                    to={`/notes/${relatedNote.id}`}
                    className="flex gap-3 group"
                  >
                    <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {relatedNote.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {relatedNote.description.substring(0, 60)}...
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;
