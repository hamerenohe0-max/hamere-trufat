# Bible/Gospel API Research & Recommendations

## 🔍 Free Open-Source Bible API Options

### Option 1: Bible API (bible-api.com) — **RECOMMENDED**
- **URL**: `https://bible-api.com/`
- **Free**: Yes, no API key required
- **Rate Limits**: Generous (suitable for mobile apps)
- **Formats**: JSON
- **Languages**: Multiple translations (KJV, ASV, WEB, etc.)
- **Example Endpoints**:
  ```
  GET https://bible-api.com/john+3:16
  GET https://bible-api.com/romans+8:28
  GET https://bible-api.com/1+corinthians+13
  ```
- **Response Format**:
  ```json
  {
    "reference": "John 3:16",
    "verses": [
      {
        "book_id": "JHN",
        "book_name": "John",
        "chapter": 3,
        "verse": 16,
        "text": "For God so loved the world..."
      }
    ],
    "text": "For God so loved the world..."
  }
  ```
- **Pros**: Simple, reliable, no auth needed
- **Cons**: No built-in daily readings endpoint (we'll need to calculate dates)

### Option 2: API.Bible (api.bible) — **ALTERNATIVE**
- **URL**: `https://api.scripture.api.bible/`
- **Free Tier**: Yes (requires API key, free tier available)
- **Rate Limits**: 500 requests/day on free tier
- **Languages**: ESV, NIV, KJV, and many more
- **Example**:
  ```
  GET https://api.scripture.api.bible/v1/bibles/{bibleId}/books
  GET https://api.scripture.api.bible/v1/bibles/{bibleId}/books/{bookId}/chapters/{chapterId}
  ```
- **Pros**: Official, well-documented, multiple translations
- **Cons**: Requires API key registration, rate limits

### Option 3: Ethiopian Orthodox Specific — **CUSTOM SOLUTION**
Since you mentioned Amharic/Geez readings, and the example endpoint you found:
```
GET /api/v1/verses/amhara/BOOK_ID/CHAPTER
GET /api/v1/verses/amhara/BOOK_ID/CHAPTER/VERSE
```

**Recommendation**: Build a custom backend module that:
1. Stores daily Gospel/readings in MongoDB (manually curated via admin panel)
2. Serves them via REST endpoints matching your example format
3. Allows admin to upload/schedule readings for specific dates
4. Supports multiple languages (Amharic, English, etc.)

## 🎯 Recommended Approach for Phase 4

### **Hybrid Solution** (Best of both worlds):

1. **For English/General Readings**:
   - Use `bible-api.com` as fallback
   - Cache responses locally for offline use
   - No API key needed = simpler implementation

2. **For Ethiopian Orthodox Specific Content**:
   - Build custom backend module (`backend/src/modules/readings/`)
   - Admin panel allows publishers to:
     - Upload daily Gospel readings
     - Schedule readings by date
     - Add Epistle, Psalms, Reflections
     - Upload audio files
   - Mobile app fetches from your backend first, falls back to bible-api.com if needed

### Implementation Plan:

```typescript
// Backend: readings.module.ts
@Controller('readings')
export class ReadingsController {
  @Get('daily/:date') // date format: YYYY-MM-DD
  async getDailyReadings(@Param('date') date: string) {
    // 1. Check MongoDB for custom reading for this date
    // 2. If found, return it
    // 3. If not, calculate lectionary date and fetch from bible-api.com
    // 4. Cache result
  }

  @Get('gospel/:date')
  async getGospel(@Param('date') date: string) {
    // Similar logic
  }
}
```

### Database Schema (MongoDB):

```typescript
// readings.schema.ts
@Schema()
export class DailyReading {
  @Prop({ required: true, unique: true })
  date!: string; // YYYY-MM-DD

  @Prop()
  gospel?: {
    book: string;
    chapter: number;
    verses: number[];
    text: string;
    audioUrl?: string;
  };

  @Prop()
  epistle?: {
    book: string;
    chapter: number;
    verses: number[];
    text: string;
  };

  @Prop()
  psalms?: {
    chapter: number;
    verses: number[];
    text: string;
  };

  @Prop()
  reflection?: string;

  @Prop()
  language?: 'amharic' | 'english' | 'geez';
}
```

## 📝 Next Steps

1. **Phase 4 Implementation**:
   - Start with mocked data in mobile app (quick UI)
   - Build backend `readings` module in parallel
   - Admin panel for content management
   - Integrate bible-api.com as fallback

2. **Admin Panel Features**:
   - Date picker for scheduling readings
   - Rich text editor for Gospel/Epistle/Psalms
   - Audio upload for readings
   - Bulk import (CSV/JSON) for multiple dates

3. **Mobile App Features**:
   - Offline caching (AsyncStorage/SQLite)
   - Date navigation (yesterday/today/tomorrow)
   - Audio player integration
   - Share functionality
   - Reminder notifications

## 🔗 Useful Resources

- **bible-api.com**: https://bible-api.com/
- **API.Bible**: https://scripture.api.bible/
- **Lectionary Calculator**: We can build a simple one based on Ethiopian Orthodox calendar

## ✅ Decision

**Recommended**: Use **custom backend + admin panel** for Ethiopian Orthodox content, with **bible-api.com as fallback** for general readings. This gives you:
- Full control over content
- Offline-first capability
- Multi-language support
- No external API dependencies for core features

