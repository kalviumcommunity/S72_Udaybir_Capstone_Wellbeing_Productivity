import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Search, Upload, Download, FileText, BookOpen, ThumbsUp, MessageSquare } from 'lucide-react';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';

const Hub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [studyNotes, setStudyNotes] = useState([
    {
      id: '1',
      title: 'Calculus: Derivatives and Integrals',
      subject: 'Mathematics',
      description: 'Comprehensive notes on differentiation and integration with examples and practice problems.',
      author: 'Jane Smith',
      date: '2023-06-05',
      likes: 25,
      comments: 8,
      tags: ['calculus', 'mathematics', 'derivatives', 'integrals'],
    },
    {
      id: '2',
      title: 'Cell Biology Fundamentals',
      subject: 'Biology',
      description: 'Detailed notes on cell structure, organelles, and cellular processes.',
      author: 'Mark Johnson',
      date: '2023-06-08',
      likes: 18,
      comments: 4,
      tags: ['biology', 'cells', 'science'],
    },
    {
      id: '3',
      title: "Shakespeare's Hamlet Analysis",
      subject: 'Literature',
      description: "Character analysis, themes, and motifs in Shakespeare's Hamlet.",
      author: 'Emma Williams',
      date: '2023-06-10',
      likes: 32,
      comments: 12,
      tags: ['literature', 'shakespeare', 'hamlet', 'analysis'],
    },
    {
      id: '4',
      title: 'World War II Timeline',
      subject: 'History',
      description: 'Chronological timeline of major events during World War II with explanations.',
      author: 'David Brown',
      date: '2023-06-12',
      likes: 45,
      comments: 15,
      tags: ['history', 'world war II', 'timeline'],
    },
    {
      id: '5',
      title: 'Chemical Bonding and Molecular Structures',
      subject: 'Chemistry',
      description: 'Notes on different types of chemical bonds and their molecular structures.',
      author: 'Sarah Lee',
      date: '2023-06-15',
      likes: 22,
      comments: 6,
      tags: ['chemistry', 'chemical bonds', 'science', 'molecules'],
    },
  ]);

  const [newNote, setNewNote] = useState({
    title: '',
    subject: '',
    description: '',
    tags: '',
  });

  const subjects = ['Mathematics', 'Biology', 'Literature', 'History', 'Chemistry', 'Physics', 'Computer Science'];

  const filteredNotes = studyNotes.filter(note => {
    const matchesQuery = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = !selectedSubject || note.subject === selectedSubject;

    return matchesQuery && matchesSubject;
  });

  const handleSubmitNote = () => {
    if (!newNote.title || !newNote.subject || !newNote.description) return;

    const note = {
      id: Date.now().toString(),
      title: newNote.title,
      subject: newNote.subject,
      description: newNote.description,
      author: 'You',
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: 0,
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    setStudyNotes([note, ...studyNotes]);

    setNewNote({
      title: '',
      subject: '',
      description: '',
      tags: '',
    });
  };

  const handleLikeNote = (id) => {
    setStudyNotes(
      studyNotes.map(note =>
        note.id === id ? { ...note, likes: note.likes + 1 } : note
      )
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Student Hub</h1>
          <p className="text-muted-foreground">Find and share study notes with other students.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search notes..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Subject</h3>
                  <div className="space-y-2">
                    <div
                      className={`cursor-pointer rounded-md px-3 py-2 text-sm transition-colors ${!selectedSubject ? 'bg-sentience-100 text-sentience-800' : 'hover:bg-muted'}`}
                      onClick={() => setSelectedSubject(null)}
                    >
                      All Subjects
                    </div>
                    {subjects.map(subject => (
                      <div
                        key={subject}
                        className={`cursor-pointer rounded-md px-3 py-2 text-sm transition-colors ${selectedSubject === subject ? 'bg-sentience-100 text-sentience-800' : 'hover:bg-muted'}`}
                        onClick={() => setSelectedSubject(subject)}
                      >
                        {subject}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-3/4">
            <Tabs defaultValue="browse">
              <TabsList className="grid grid-cols-2 w-full md:w-80 mb-6">
                <TabsTrigger value="browse">Browse Notes</TabsTrigger>
                <TabsTrigger value="share">Share Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="browse">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-1">No notes found</h3>
                    <p>Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotes.map((note) => (
                      <Card key={note.id}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{note.title}</CardTitle>
                              <CardDescription>{note.subject} • {new Date(note.date).toLocaleDateString()}</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-sentience-100 text-sentience-800 hover:bg-sentience-200">
                              {note.subject}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-sm">{note.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {note.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-3 border-t">
                          <div className="text-sm text-muted-foreground">
                            By {note.author}
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-8 gap-1"
                                onClick={() => handleLikeNote(note.id)}
                              >
                                <ThumbsUp className="h-4 w-4" />
                                <span>{note.likes}</span>
                              </Button>
                            </div>
                            <div className="flex items-center">
                              <Button variant="ghost" size="sm" className="p-1 h-8 gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{note.comments}</span>
                              </Button>
                            </div>
                            <Button variant="outline" size="sm" className="h-8">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="share">
                <Card>
                  <CardHeader>
                    <CardTitle>Share Your Notes</CardTitle>
                    <CardDescription>
                      Help other students by sharing your study notes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">
                          Title
                        </label>
                        <Input
                          id="title"
                          placeholder="Note title"
                          value={newNote.title}
                          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">
                          Subject
                        </label>
                        <select
                          id="subject"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={newNote.subject}
                          onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                        >
                          <option value="">Select a subject</option>
                          {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description
                      </label>
                      <Textarea
                        id="description"
                        placeholder="Describe your notes..."
                        rows={4}
                        value={newNote.description}
                        onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="tags" className="text-sm font-medium">
                        Tags (comma separated)
                      </label>
                      <Input
                        id="tags"
                        placeholder="e.g., calculus, mathematics, formulas"
                        value={newNote.tags}
                        onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="file" className="text-sm font-medium">
                        Upload File (optional)
                      </label>
                      <div className="border border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop your file here, or click to browse
                        </p>
                        <Input
                          id="file"
                          type="file"
                          className="hidden"
                        />
                        <Button variant="outline" onClick={() => document.getElementById('file').click()}>
                          Browse Files
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleSubmitNote}
                      disabled={!newNote.title || !newNote.subject || !newNote.description}
                      className="bg-sentience-500 hover:bg-sentience-600"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Share Notes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Hub;
