// Validation utilities for form inputs

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name) {
    errors.push('Name is required');
  } else {
    if (name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    if (name.length > 50) {
      errors.push('Name must be less than 50 characters');
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.push('Name can only contain letters and spaces');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Task validation
export const validateTask = (task: {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  if (!task.title || task.title.trim().length === 0) {
    errors.push('Task title is required');
  } else if (task.title.length > 100) {
    errors.push('Task title must be less than 100 characters');
  }
  
  if (task.description && task.description.length > 500) {
    errors.push('Task description must be less than 500 characters');
  }
  
  if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
    errors.push('Invalid priority level');
  }
  
  if (task.status && !['todo', 'in_progress', 'done'].includes(task.status)) {
    errors.push('Invalid status');
  }
  
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid due date');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Mood validation
export const validateMood = (mood: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!mood) {
    errors.push('Mood is required');
  } else {
    const validMoods = ['terrible', 'bad', 'neutral', 'good', 'excellent'];
    if (!validMoods.includes(mood)) {
      errors.push('Invalid mood selection');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Study session validation
export const validateStudySession = (session: {
  subject: string;
  startTime: string;
  duration: number;
  notes?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  if (!session.subject || session.subject.trim().length === 0) {
    errors.push('Subject is required');
  } else if (session.subject.length > 100) {
    errors.push('Subject must be less than 100 characters');
  }
  
  if (!session.startTime) {
    errors.push('Start time is required');
  } else {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(session.startTime)) {
      errors.push('Invalid time format (HH:MM)');
    }
  }
  
  if (!session.duration || session.duration <= 0) {
    errors.push('Duration must be greater than 0');
  } else if (session.duration > 480) { // 8 hours max
    errors.push('Duration cannot exceed 8 hours');
  }
  
  if (session.notes && session.notes.length > 500) {
    errors.push('Notes must be less than 500 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Note validation
export const validateNote = (note: {
  title: string;
  content: string;
  category?: string;
  tags?: string;
  privacy?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  if (!note.title || note.title.trim().length === 0) {
    errors.push('Note title is required');
  } else if (note.title.length > 200) {
    errors.push('Note title must be less than 200 characters');
  }
  
  if (!note.content || note.content.trim().length === 0) {
    errors.push('Note content is required');
  } else if (note.content.length > 10000) {
    errors.push('Note content must be less than 10,000 characters');
  }
  
  if (note.category && note.category.length > 100) {
    errors.push('Category must be less than 100 characters');
  }
  
  if (note.tags) {
    const tags = note.tags.split(',').map(tag => tag.trim());
    if (tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }
    for (const tag of tags) {
      if (tag.length > 20) {
        errors.push('Each tag must be less than 20 characters');
        break;
      }
    }
  }
  
  if (note.privacy && !['private', 'global'].includes(note.privacy)) {
    errors.push('Invalid privacy setting');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generic form validation
export const validateForm = (data: Record<string, unknown>, rules: Record<string, (value: unknown) => ValidationResult>): ValidationResult => {
  const errors: string[] = [];
  
  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(data[field]);
    errors.push(...result.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 