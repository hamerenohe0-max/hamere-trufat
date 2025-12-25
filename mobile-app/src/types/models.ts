export type Role = 'collector' | 'publisher' | 'admin';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: 'active' | 'suspended';
  lastActiveAt?: string;
  avatarUrl?: string;
  profile?: {
    bio?: string;
    avatarUrl?: string;
    language?: string;
    region?: string;
    phone?: string;
  };
  lastLoginAt?: string;
}

export interface Assignment extends BaseEntity {
  title: string;
  description: string;
  region: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'complete';
  assigneeId: string;
  submissionIds: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface Submission extends BaseEntity {
  assignmentId: string;
  collectorId: string;
  payload: {
    text?: string;
    photos?: string[];
    videos?: string[];
    documents?: string[];
  };
  coordinates?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  syncState: 'pending' | 'synced' | 'failed';
  deviceId: string;
}

export interface NewsItem extends BaseEntity {
  title: string;
  summary: string;
  body: string;
  tags: string[];
  images?: string[];
  authorId: string;
  publishedAt?: string;
  status: 'draft' | 'scheduled' | 'published';
}

export interface Article extends BaseEntity {
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  images?: string[];
  authorId: string;
  publishedAt?: string;
  relatedEventIds: string[];
}

export interface Author extends BaseEntity {
  name: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  followers?: number;
  articlesCount?: number;
}

export interface SpiritualArticle extends Article {
  excerpt: string;
  audioUrl?: string;
  readingTime: string;
  author?: Author;
  keywords: string[];
  bookmarked?: boolean;
}

export interface Event extends BaseEntity {
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  description?: string;
  feastId?: string;
  featured: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  flyerImages?: string[];
  reminderEnabled?: boolean;
}

export interface Feast extends BaseEntity {
  name: string;
  date: string;
  region: string;
  description?: string;
  icon?: string;
  articleIds: string[];
  biography?: string;
  traditions?: string[];
  readings?: string[];
  prayers?: string[];
  reminderEnabled?: boolean;
}

export interface Notification extends BaseEntity {
  type: 'assignment' | 'submission' | 'news' | 'system';
  title: string;
  body: string;
  targetUserIds: string[];
  metadata?: Record<string, unknown>;
  readByUserIds: string[];
  sentAt?: string;
}

export interface OfflineCacheRecord<TPayload = unknown> {
  key: string;
  entity: string;
  payload: TPayload;
  expiresAt?: string;
  version: number;
  checksum: string;
}

export interface DashboardSummary {
  date: string;
  dailyGospel: {
    title: string;
    reference: string;
    body: string;
  };
  latestNews: NewsItem[];
  progressReports: ProgressReport[];
  featuredArticle?: SpiritualArticle;
  todaysSaint?: {
    name: string;
    biography: string;
    portraitUrl?: string;
  };
  upcomingEvent?: Event;
  quickLinks: Array<{
    label: string;
    icon: string;
    href: string;
  }>;
}

export interface NewsComment extends BaseEntity {
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  body: string;
  translatedBody?: string;
  likes: number;
  liked?: boolean;
}

export interface NewsDetail extends NewsItem {
  content: string;
  coverImage?: string; // For backward compatibility
  images?: string[]; // Up to 4 images
  comments: NewsComment[];
  reactions: {
    likes: number;
    dislikes: number;
    userReaction?: 'like' | 'dislike' | null;
  };
  related: NewsItem[];
  bookmarked?: boolean;
  language?: string;
  translation?: {
    language: string;
    body: string;
  };
}

export interface ProgressReport extends BaseEntity {
  title: string;
  summary: string;
  pdfUrl?: string;
  beforeImage?: string;
  afterImage?: string;
  timeline: Array<{
    label: string;
    description: string;
    date: string;
  }>;
  likes: number;
  liked?: boolean;
  commentsCount: number;
  mediaGallery?: string[];
}

export interface DailyReading {
  id: string;
  date: string;
  gospel: {
    title: string;
    reference: string;
    body: string;
    audioUrl?: string;
  };
  epistle: {
    title: string;
    reference: string;
    body: string;
  };
  psalms: string[];
  reflections: string[];
  reminderEnabled?: boolean;
}

export interface ReminderPreference {
  id: string;
  label: string;
  enabled: boolean;
  time?: string;
}

export interface GameScore {
  id: string;
  game: 'trivia' | 'puzzle' | 'saint' | 'memory';
  score: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}



