export interface Skill {
  name: string;
  category: 'Soft Skill' | 'Hard Skill' | 'Tool/Tech';
  score: number; // 0-100 proficiency estimate
}

export interface CareerPath {
  title: string;
  matchPercentage: number;
  description: string;
  avgSalary: string;
  outlook: string;
}

export interface Badge {
  name: string;
  emoji: string;
  description: string;
  color: string; // hex or tailwind class hint
}

export interface InterviewQuestion {
  question: string;
  tip: string;
}

export interface AnalysisResult {
  summary: string;
  vibe: string; // e.g., "The Creative Visionary"
  vibeEmoji: string;
  skills: Skill[];
  badges: Badge[];
  elevatorPitch: string;
  resumePoints: string[];
  careers: CareerPath[];
  interviewQuestions: InterviewQuestion[];
}

export interface AppState {
  status: 'idle' | 'scanning' | 'analyzing' | 'success' | 'error';
  message?: string;
}