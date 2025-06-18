import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';

const Planner = () => {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Complete Math Assignment',
      description: 'Finish calculus problems 1-10',
      dueDate: '2023-06-15',
      completed: false,
      priority: 'high',
    },
    {
      id: '2',
      title: 'Read Chapter 5',
      description: 'Literature textbook pages 120-150',
      dueDate: '2023-06-14',
      completed: false,
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Research Project',
      description: 'Gather sources for history project',
      dueDate: '2023-06-20',
      completed: false,
      priority: 'low',
    },
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
  });

  const addTask = () => {
    if (newTask.title.trim() === '') return;
    
    const task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      completed: false,
      priority: newTask.priority,
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
    });
  };

  const toggleTaskCompletion = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Student Planner</h1>
          <Button className="bg-sentience-500 hover:bg-sentience-600">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md mb-8">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Task</CardTitle>
                <CardDescription>
                  Add details about your task and track your progress.
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
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dueDate" className="text-sm font-medium">
                      Due Date
                    </label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="description"
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <div className="flex space-x-2">
                    {(['low', 'medium', 'high']).map((priority) => (
                      <Button
                        key={priority}
                        type="button"
                        variant={newTask.priority === priority ? 'default' : 'outline'}
                        onClick={() => setNewTask({ ...newTask, priority })}
                        className={newTask.priority === priority ? 'bg-sentience-500 hover:bg-sentience-600' : ''}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={addTask} className="bg-sentience-500 hover:bg-sentience-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className={task.completed ? 'opacity-60' : ''}>
                  <CardHeader className="pb-3 flex flex-row items-start space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(task.id)}
                          className="w-5 h-5 rounded-md border-gray-300 text-sentience-500 focus:ring-sentience-500"
                        />
                        <CardTitle className={task.completed ? 'line-through text-muted-foreground' : ''}>
                          {task.title}
                        </CardTitle>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <CardDescription className="mt-1">{task.description}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>
                  View your tasks in calendar format.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px] flex items-center justify-center border rounded-lg p-4 text-muted-foreground">
                  Calendar view will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>
                  Manage your study notes here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px] flex items-center justify-center border rounded-lg p-4 text-muted-foreground">
                  Notes section will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Planner;
