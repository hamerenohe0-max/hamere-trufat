export interface DailyReading {
  id: string;
  date: string;
  gospel: {
    book: string;
    chapter: number;
    verses: number[];
    text: string;
    audioUrl?: string;
  };
  epistle?: {
    book: string;
    chapter: number;
    verses: number[];
    text: string;
  };
  psalms?: {
    chapter: number;
    verses: number[];
    text: string;
  };
  reflection?: string;
  language: 'amharic' | 'english' | 'geez';
}

export const mockReadings: DailyReading[] = [
  {
    id: 'reading-1',
    date: '2025-12-24',
    gospel: {
      book: 'ማቴዎስ',
      chapter: 1,
      verses: [18, 25],
      text: 'የኢየሱስ ክርስቶስ ልደት በዚህ መልኩ ሆነ። እናቱ ማርያም ለዮሴፍ ተገባሽ ነበር፥ ነገር ግን አስቀድሞ አንድ ላይ ከመሆናቸው በፊት በመንፈስ ቅዱስ እርግዝና አገኘች።',
      audioUrl: 'gospel-2025-12-24.mp3',
    },
    epistle: {
      book: 'ጴጥሮስ',
      chapter: 1,
      verses: [1, 2],
      text: 'ጴጥሮስ አልጋው ለተበተኑት ለመጻሕፍት ለሚኖሩት ለአሕዛብ ለአሕዛብ ለአሕዛብ ለአሕዛብ',
    },
    psalms: {
      chapter: 23,
      verses: [1, 6],
      text: 'ጌታ እረዳቴ ነው፥ ምንም አልጠጋም።',
    },
    reflection: 'ዛሬ የኢየሱስ ክርስቶስን ልደት እናስታውሳለን። ይህ ታላቅ በዓል ለእኛ ሁሉ የመድኃኒት ተስፋ ነው።',
    language: 'amharic',
  },
  {
    id: 'reading-2',
    date: '2025-12-25',
    gospel: {
      book: 'ሉቃስ',
      chapter: 2,
      verses: [1, 20],
      text: 'በዚያን ጊዜ የሴሳር አውግስጦስ ከሮም የመንግሥት ትዕዛዝ ወጣ፥ ሁሉም ወገን ይመዘግብ ዘንድ ነበር።',
      audioUrl: 'gospel-2025-12-25.mp3',
    },
    reflection: 'የክርስቶስ ልደት በዓል ለእኛ ሁሉ የመድኃኒት ተስፋ ነው።',
    language: 'amharic',
  },
];

