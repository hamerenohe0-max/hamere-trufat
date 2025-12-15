export interface ProgressReport {
  id: string;
  title: string;
  description: string;
  date: string;
  images: string[];
  pdfUrl?: string;
  beforeImages?: string[];
  afterImages?: string[];
  timeline: TimelineEvent[];
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export const mockProgressReports: ProgressReport[] = [
  {
    id: 'progress-1',
    title: 'የቤተክርስቲያን ሕንፃ የግንባታ ስራ',
    description: 'ደብረ ምህረት መድኃኔዓለም ቤተክርስቲያን ሕንፃ የግንባታ ስራ ሪፖርት',
    date: '2025-10-15',
    images: ['progress-1-1.jpg', 'progress-1-2.jpg'],
    pdfUrl: 'progress-report-1.pdf',
    beforeImages: ['progress-1-before-1.jpg'],
    afterImages: ['progress-1-after-1.jpg', 'progress-1-after-2.jpg'],
    timeline: [
      {
        date: '2025-09-01',
        title: 'የግንባታ ስራ መጀመር',
        description: 'የመሠረት ስራ ተጀምሯል',
      },
      {
        date: '2025-10-01',
        title: 'የግድግዳ ስራ',
        description: 'የግድግዳ ስራ ተጠናቋል',
      },
      {
        date: '2025-10-15',
        title: 'የጣሪያ ስራ',
        description: 'የጣሪያ ስራ በመሻሻል ላይ',
      },
    ],
    likes: 24,
    comments: 8,
    createdAt: '2025-10-15T20:59:00Z',
    updatedAt: '2025-10-15T20:59:00Z',
  },
  {
    id: 'progress-2',
    title: 'የሰንበት ትምህርት ቤት ዝማሬ',
    description: 'የሰንበት ትምህርት ቤት ተማሪዎች ዝማሬ ማቅረብ',
    date: '2025-09-12',
    images: ['progress-2-1.jpg'],
    timeline: [
      {
        date: '2025-09-01',
        title: 'የዝማሬ ማሰልጠኛ',
        description: 'ተማሪዎች ዝማሬ ማሰልጠን ጀምረዋል',
      },
      {
        date: '2025-09-12',
        title: 'የዝማሬ ማቅረብ',
        description: 'በበዓል ላይ ዝማሬ ተቀርቧል',
      },
    ],
    likes: 18,
    comments: 5,
    createdAt: '2025-09-12T19:21:00Z',
    updatedAt: '2025-09-12T19:21:00Z',
  },
];

