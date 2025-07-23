// Types for the CTF Dashboard
export interface Team {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
  totalScore: number;
  lastActivity: string;
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
}

export interface TeamProgress {
  teamId: string;
  teamName: string;
  completedChallenges: string[];
  totalScore: number;
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
