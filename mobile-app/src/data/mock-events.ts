import { Event } from '../types/models';

export const mockEvents: Event[] = [
  {
    id: 'event-1',
    createdAt: '2025-12-02T12:57:00Z',
    updatedAt: '2025-12-02T12:57:00Z',
    name: 'የኑ ከዚህ ዓለም እንውጣ የኅዳር ወር ጉባኤ',
    startDate: '2025-12-15T09:30:00Z',
    endDate: '2025-12-15T12:00:00Z',
    location: 'ሐመረ ኖኅ አዳራሽ, አዲስ አበባ',
    description: 'የኅዳር ወር መደበኛ ጉባኤ - ጸሎተ ወንጌል፣ ዝማሬ፣ ትምህርተ ወንጌል',
    featured: true,
  },
  {
    id: 'event-2',
    createdAt: '2025-12-02T12:57:00Z',
    updatedAt: '2025-12-02T12:57:00Z',
    name: 'የአንደኛ ዓመት የምስረታ በዓል',
    startDate: '2025-12-20T07:35:00Z',
    endDate: '2025-12-20T11:00:00Z',
    location: 'ደብረ ትጉሃን ቅዱስ ሚካኤል ቤተክርስቲያን, ላፍቶ',
    description: 'ሐመረ ኖኅ ማኅበር የአንደኛ ዓመት ምስረታ በዓል - ጸሎተ ወንጌል፣ ዝማሬ፣ ትምህርተ ወንጌል፣ የስራ ሪፖርት',
    featured: true,
  },
  {
    id: 'event-3',
    createdAt: '2025-12-02T12:59:00Z',
    updatedAt: '2025-12-02T12:59:00Z',
    name: 'የገቢ ማሰባሰቢያ መርሐግብር',
    startDate: '2025-12-10T16:00:00Z',
    endDate: '2025-12-10T18:00:00Z',
    location: 'ደብረ ምህረት መድኃኔዓለም ቤተክርስቲያን, መንዝ',
    description: 'የቤተክርስቲያን ሕንፃ ለማሰራት የገቢ ማሰባሰቢያ መርሐግብር',
    featured: false,
  },
  {
    id: 'event-4',
    createdAt: '2025-12-02T13:05:00Z',
    updatedAt: '2025-12-02T13:05:00Z',
    name: 'የሰንበት ትምህርት ቤት ዝማሬ',
    startDate: '2025-12-22T10:00:00Z',
    endDate: '2025-12-22T12:00:00Z',
    location: 'ኰኵሐ ሃይማኖት ሰንበት ትምህርት ቤት',
    description: 'የሰንበት ትምህርት ቤት ተማሪዎች መዝሙር ማቅረብ',
    featured: false,
  },
];

