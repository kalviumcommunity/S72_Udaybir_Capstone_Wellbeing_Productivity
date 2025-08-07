import { toast } from '@/hooks/use-toast';

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  createdBy: string;
  members: GroupMember[];
  maxMembers: number;
  isPublic: boolean;
  createdAt: Date;
  lastActivity: Date;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  lastActive: Date;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'study-note';
}

export interface GroupStudySession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  participants: string[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

interface StoredGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  createdBy: string;
  members: StoredMember[];
  maxMembers: number;
  isPublic: boolean;
  createdAt: string;
  lastActivity: string;
}

interface StoredMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  lastActive: string;
}

interface StoredMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'study-note';
}

interface StoredSession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  participants: string[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

class StudyGroupsService {
  // Create a new study group
  createGroup(group: Omit<StudyGroup, 'id' | 'createdAt' | 'lastActivity'>): StudyGroup {
    const newGroup: StudyGroup = {
      ...group,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.saveGroup(newGroup);
    
    toast({
      title: "Study group created",
      description: `${group.name} has been created successfully`,
    });

    return newGroup;
  }

  // Save group to localStorage
  private saveGroup(group: StudyGroup): void {
    try {
      const groups = this.getAllGroups();
      const existingIndex = groups.findIndex(g => g.id === group.id);
      
      if (existingIndex >= 0) {
        groups[existingIndex] = group;
      } else {
        groups.push(group);
      }

      localStorage.setItem('studyGroups', JSON.stringify(groups));
    } catch (error) {
      console.error('Failed to save study group:', error);
    }
  }

  // Get all study groups
  getAllGroups(): StudyGroup[] {
    try {
      const stored = localStorage.getItem('studyGroups');
      if (!stored) return [];

      const groups: StoredGroup[] = JSON.parse(stored);
      return groups.map((group) => ({
        ...group,
        createdAt: new Date(group.createdAt),
        lastActivity: new Date(group.lastActivity),
        members: group.members.map((member) => ({
          ...member,
          joinedAt: new Date(member.joinedAt),
          lastActive: new Date(member.lastActive)
        }))
      }));
    } catch (error) {
      console.error('Failed to load study groups:', error);
      return [];
    }
  }

  // Get groups by user
  getUserGroups(userId: string): StudyGroup[] {
    const groups = this.getAllGroups();
    return groups.filter(group => 
      group.members.some(member => member.id === userId)
    );
  }

  // Get public groups
  getPublicGroups(): StudyGroup[] {
    const groups = this.getAllGroups();
    return groups.filter(group => group.isPublic);
  }

  // Join a study group
  joinGroup(groupId: string, user: Omit<GroupMember, 'joinedAt' | 'lastActive'>): boolean {
    try {
      const groups = this.getAllGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);
      
      if (groupIndex === -1) {
        toast({
          title: "Group not found",
          description: "The study group could not be found",
          variant: "destructive"
        });
        return false;
      }

      const group = groups[groupIndex];
      
      // Check if user is already a member
      if (group.members.some(m => m.id === user.id)) {
        toast({
          title: "Already a member",
          description: "You are already a member of this group",
          variant: "destructive"
        });
        return false;
      }

      // Check if group is full
      if (group.members.length >= group.maxMembers) {
        toast({
          title: "Group is full",
          description: "This study group has reached its maximum capacity",
          variant: "destructive"
        });
        return false;
      }

      const newMember: GroupMember = {
        ...user,
        joinedAt: new Date(),
        lastActive: new Date()
      };

      group.members.push(newMember);
      group.lastActivity = new Date();
      
      this.saveGroup(group);
      
      toast({
        title: "Joined group",
        description: `You have successfully joined ${group.name}`,
      });

      return true;
    } catch (error) {
      console.error('Failed to join study group:', error);
      return false;
    }
  }

  // Leave a study group
  leaveGroup(groupId: string, userId: string): boolean {
    try {
      const groups = this.getAllGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);
      
      if (groupIndex === -1) return false;

      const group = groups[groupIndex];
      const memberIndex = group.members.findIndex(m => m.id === userId);
      
      if (memberIndex === -1) return false;

      // Remove member
      group.members.splice(memberIndex, 1);
      group.lastActivity = new Date();
      
      // If no members left, delete the group
      if (group.members.length === 0) {
        this.deleteGroup(groupId);
        toast({
          title: "Group deleted",
          description: "The study group has been deleted as it has no members",
        });
      } else {
        this.saveGroup(group);
        toast({
          title: "Left group",
          description: `You have left ${group.name}`,
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to leave study group:', error);
      return false;
    }
  }

  // Delete a study group
  deleteGroup(groupId: string): boolean {
    try {
      const groups = this.getAllGroups();
      const filteredGroups = groups.filter(g => g.id !== groupId);
      localStorage.setItem('studyGroups', JSON.stringify(filteredGroups));
      
      // Also delete associated messages and sessions
      this.deleteGroupMessages(groupId);
      this.deleteGroupSessions(groupId);
      
      return true;
    } catch (error) {
      console.error('Failed to delete study group:', error);
      return false;
    }
  }

  // Send a message to a group
  sendMessage(message: Omit<GroupMessage, 'id' | 'timestamp'>): GroupMessage {
    const newMessage: GroupMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    this.saveMessage(newMessage);
    
    // Update group's last activity
    this.updateGroupActivity(message.groupId);
    
    return newMessage;
  }

  // Save message to localStorage
  private saveMessage(message: GroupMessage): void {
    try {
      const messages = this.getGroupMessages(message.groupId);
      messages.push(message);
      localStorage.setItem(`groupMessages_${message.groupId}`, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save group message:', error);
    }
  }

  // Get messages for a group
  getGroupMessages(groupId: string): GroupMessage[] {
    try {
      const stored = localStorage.getItem(`groupMessages_${groupId}`);
      if (!stored) return [];

      const messages: StoredMessage[] = JSON.parse(stored);
      return messages.map((message) => ({
        ...message,
        timestamp: new Date(message.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load group messages:', error);
      return [];
    }
  }

  // Delete all messages for a group
  private deleteGroupMessages(groupId: string): void {
    try {
      localStorage.removeItem(`groupMessages_${groupId}`);
    } catch (error) {
      console.error('Failed to delete group messages:', error);
    }
  }

  // Create a group study session
  createGroupSession(session: Omit<GroupStudySession, 'id'>): GroupStudySession {
    const newSession: GroupStudySession = {
      ...session,
      id: Date.now().toString()
    };

    this.saveGroupSession(newSession);
    
    toast({
      title: "Study session scheduled",
      description: `Group study session "${session.title}" has been scheduled`,
    });

    return newSession;
  }

  // Save group session to localStorage
  private saveGroupSession(session: GroupStudySession): void {
    try {
      const sessions = this.getGroupSessions(session.groupId);
      sessions.push(session);
      localStorage.setItem(`groupSessions_${session.groupId}`, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save group session:', error);
    }
  }

  // Get sessions for a group
  getGroupSessions(groupId: string): GroupStudySession[] {
    try {
      const stored = localStorage.getItem(`groupSessions_${groupId}`);
      if (!stored) return [];

      const sessions: StoredSession[] = JSON.parse(stored);
      return sessions.map((session) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime)
      }));
    } catch (error) {
      console.error('Failed to load group sessions:', error);
      return [];
    }
  }

  // Delete all sessions for a group
  private deleteGroupSessions(groupId: string): void {
    try {
      localStorage.removeItem(`groupSessions_${groupId}`);
    } catch (error) {
      console.error('Failed to delete group sessions:', error);
    }
  }

  // Update group's last activity
  private updateGroupActivity(groupId: string): void {
    try {
      const groups = this.getAllGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);
      
      if (groupIndex !== -1) {
        groups[groupIndex].lastActivity = new Date();
        this.saveGroup(groups[groupIndex]);
      }
    } catch (error) {
      console.error('Failed to update group activity:', error);
    }
  }

  // Search groups by name or subject
  searchGroups(query: string): StudyGroup[] {
    const groups = this.getAllGroups();
    const lowercaseQuery = query.toLowerCase();
    
    return groups.filter(group => 
      group.name.toLowerCase().includes(lowercaseQuery) ||
      group.subject.toLowerCase().includes(lowercaseQuery) ||
      group.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get group statistics
  getGroupStats(groupId: string): {
    memberCount: number;
    messageCount: number;
    sessionCount: number;
    activeMembers: number;
  } {
    const groups = this.getAllGroups();
    const group = groups.find(g => g.id === groupId);
    
    if (!group) {
      return { memberCount: 0, messageCount: 0, sessionCount: 0, activeMembers: 0 };
    }

    const messages = this.getGroupMessages(groupId);
    const sessions = this.getGroupSessions(groupId);
    
    // Count active members (active in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeMembers = group.members.filter(member => 
      member.lastActive > sevenDaysAgo
    ).length;

    return {
      memberCount: group.members.length,
      messageCount: messages.length,
      sessionCount: sessions.length,
      activeMembers
    };
  }

  // Export group data
  exportGroupData(groupId: string): void {
    try {
      const groups = this.getAllGroups();
      const group = groups.find(g => g.id === groupId);
      
      if (!group) {
        toast({
          title: "Group not found",
          description: "The study group could not be found",
          variant: "destructive"
        });
        return;
      }

      const messages = this.getGroupMessages(groupId);
      const sessions = this.getGroupSessions(groupId);
      
      const data = {
        group,
        messages,
        sessions,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-group-${group.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Group data exported",
        description: "Study group data has been saved to a file",
      });
    } catch (error) {
      console.error('Failed to export group data:', error);
      toast({
        title: "Export failed",
        description: "Failed to export group data",
        variant: "destructive"
      });
    }
  }
}

export const studyGroupsService = new StudyGroupsService(); 