import { Feast } from '../types/models';

export const mockFeasts: Feast[] = [
  {
    id: 'feast-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    name: 'ገና (የክርስቶስ ልደት)',
    date: '2025-01-07',
    region: 'Ethiopian Orthodox',
    description: 'የኢየሱስ ክርስቶስ ልደት በዓል',
    icon: 'feast-genna.png',
    articleIds: ['article-1'],
  },
  {
    id: 'feast-2',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    name: 'ጥምቀት (የክርስቶስ ጥምቀት)',
    date: '2025-01-19',
    region: 'Ethiopian Orthodox',
    description: 'የኢየሱስ ክርስቶስ ጥምቀት በዓል',
    icon: 'feast-timket.png',
    articleIds: [],
  },
  {
    id: 'feast-3',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    name: 'ፋሲካ (የትንሣኤ)',
    date: '2025-04-20',
    region: 'Ethiopian Orthodox',
    description: 'የኢየሱስ ክርስቶስ ትንሣኤ በዓል',
    icon: 'feast-fasika.png',
    articleIds: [],
  },
];

