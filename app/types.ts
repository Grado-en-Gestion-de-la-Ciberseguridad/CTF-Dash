// Types for the CTF Dashboard
export interface Team {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
  totalScore: number;
  lastActivity: string;
  password: string; // Added for login
  currentMembers?: string[]; // Members currently logged in
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff' | 'team';
  name: string;
  teamId?: string; // For team members
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isTeam: boolean;
}

export interface Challenge {
  id: string;
  roomId: string;
  roomName: string;
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'security-awareness' | 'password-security' | 'osint' | 'cryptography';
  isActive: boolean;
  correctAnswer?: string;
  acceptedAnswers?: string[];
  hints?: string[];
  penaltyPerIncorrect?: number; // Points deducted for each incorrect answer
  maxIncorrectAttempts?: number; // Maximum incorrect attempts before challenge is locked
}

export interface Submission {
  id: string;
  teamId: string;
  challengeId: string;
  answer: string;
  submittedAt: string;
  status: 'pending' | 'correct' | 'incorrect' | 'reviewed';
  points: number;
  reviewedBy?: string;
  reviewNotes?: string;
  penalty?: number; // Penalty points for incorrect answers
}

export interface TeamProgress {
  teamId: string;
  teamName: string;
  completedChallenges: string[];
  totalScore: number;
  totalPoints?: number; // Points earned from correct submissions
  totalPenalties?: number; // Penalty points from incorrect submissions
  lastSubmission: string;
  rank: number;
}

export interface AdminStats {
  totalTeams: number;
  totalSubmissions: number;
  completedChallenges: number;
  averageScore: number;
  topTeam: string;
}

export interface HackerStoryProgress {
  teamId: string;
  hackerIdentified: boolean;
  documentsIdentified: string[];
  hideoutLocated: boolean;
  bonusPoints: number;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  challenges: Challenge[];
  isActive: boolean;
  maxPoints: number;
}
